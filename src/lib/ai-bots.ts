import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/slug";
import Anthropic from "@anthropic-ai/sdk";

const CONTENT_GUARDRAILS =
  "Do not give financial or legal advice. Do not guarantee wins or returns. Stay on-topic. Be respectful. When mentioning casinos or sportsbooks, use their exact brand name (e.g. DraftKings, BetMGM, Bovada) so they can be linked. Do not include URLs yourself.";

export type AiBotProfileWithUser = {
  id: string;
  userId: string;
  name: string;
  systemPrompt: string;
  threadTopics: string | null;
  allowedForums: string | null;
  maxResponsesPerHour: number;
  maxResponsesPerDay: number;
  enabled: boolean;
  defaultForumSlug: string | null;
  appendPartnerLinks: boolean;
  /** When set, bot only runs sports digest for this key — not general forum automation */
  digestSportKey: string | null;
  user: { id: string; username: string };
};

export type ProductForLinking = {
  brandName: string;
  siteUrl: string;
  slug: string;
};

/** Fetch all enabled bots with their user data */
export async function getEnabledBots(): Promise<AiBotProfileWithUser[]> {
  const bots = await prisma.aiBotProfile.findMany({
    where: { enabled: true },
    include: { user: { select: { id: true, username: true } } },
  });
  return bots as AiBotProfileWithUser[];
}

/**
 * Bots that participate in general forum automation (new-thread comments, replies, proactive threads).
 * Digest-only bots (`digestSportKey` set) are excluded.
 */
export async function getEnabledBotsForForumEngagement(): Promise<
  AiBotProfileWithUser[]
> {
  const bots = await prisma.aiBotProfile.findMany({
    where: { enabled: true, digestSportKey: null },
    include: { user: { select: { id: true, username: true } } },
  });
  return bots as AiBotProfileWithUser[];
}

/** Get bot user IDs for exclusion (bot-on-bot prevention) */
export async function getBotUserIds(): Promise<Set<string>> {
  const bots = await getEnabledBots();
  return new Set(bots.map((b) => b.userId));
}

/** Bot user IDs for forum engagement only (excludes digest-only bots) */
export async function getBotUserIdsForForumEngagement(): Promise<Set<string>> {
  const bots = await getEnabledBotsForForumEngagement();
  return new Set(bots.map((b) => b.userId));
}

/** Fetch products (sportsbook, casino, crypto) for auto-linking */
export async function getProductsForLinking(): Promise<ProductForLinking[]> {
  const products = await prisma.product.findMany({
    where: {
      productType: { in: ["sportsbook", "casino", "crypto"] },
      siteUrl: { not: null },
    },
    include: { post: { select: { slug: true } } },
  });
  return products
    .filter((p) => p.siteUrl)
    .map((p) => ({
      brandName: p.brandName,
      siteUrl: p.siteUrl!,
      slug: p.post.slug,
    }));
}

/** Replace brand name mentions with Play Now links */
export function linkProductMentions(
  text: string,
  products: ProductForLinking[]
): string {
  if (!products.length) return text;
  // Sort by brandName length descending so "Draft Kings" matches before "Draft"
  const sorted = [...products].sort(
    (a, b) => b.brandName.length - a.brandName.length
  );
  let result = text;
  for (const p of sorted) {
    const escaped = p.brandName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(
      `(?<!["'<>\\/])(${escaped})(?![^<]*>)(?![^"]*")`,
      "gi"
    );
    result = result.replace(regex, (match) => {
      return `<a href="${p.siteUrl}" target="_blank" rel="noopener noreferrer">${match}</a>`;
    });
  }
  return result;
}

/** Check if forum allows bots (not humanOnly) */
export async function isForumBotAllowed(forumSlug: string | null): Promise<boolean> {
  if (!forumSlug) return true;
  const meta = await prisma.forumMeta.findUnique({
    where: { slug: forumSlug },
    select: { humanOnly: true },
  });
  return !meta?.humanOnly;
}

/** Check if bot has already commented on this post */
export async function hasBotCommentedOnPost(
  postId: string,
  botUserIds: Set<string>
): Promise<boolean> {
  const comment = await prisma.comment.findFirst({
    where: { postId, userId: { in: [...botUserIds] } },
    select: { id: true },
  });
  return !!comment;
}

/** Count bot responses in last hour/day for rate limiting */
export async function getBotResponseCounts(
  botUserId: string,
  sinceHour: Date,
  sinceDay: Date
): Promise<{ hour: number; day: number }> {
  const [hourCount, dayCount] = await Promise.all([
    prisma.aiBotActivityLog.count({
      where: { botUserId, createdAt: { gte: sinceHour }, dryRun: false },
    }),
    prisma.aiBotActivityLog.count({
      where: { botUserId, createdAt: { gte: sinceDay }, dryRun: false },
    }),
  ]);
  return { hour: hourCount, day: dayCount };
}

/** Check if bot can respond (rate limits, forum allowlist) */
export async function canBotRespond(
  profile: AiBotProfileWithUser,
  postForumSlug: string | null
): Promise<boolean> {
  const now = new Date();
  const sinceHour = new Date(now.getTime() - 60 * 60 * 1000);
  const sinceDay = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const { hour, day } = await getBotResponseCounts(
    profile.userId,
    sinceHour,
    sinceDay
  );
  if (hour >= profile.maxResponsesPerHour || day >= profile.maxResponsesPerDay)
    return false;
  if (!(await isForumBotAllowed(postForumSlug))) return false;
  if (profile.allowedForums) {
    try {
      const allowed: string[] = JSON.parse(profile.allowedForums);
      if (allowed.length > 0 && postForumSlug && !allowed.includes(postForumSlug))
        return false;
    } catch {
      // invalid JSON, allow all
    }
  }
  return true;
}

/** Simple topic match: does thread title/body contain keywords from bot's threadTopics? */
export function shouldBotRespond(
  profile: AiBotProfileWithUser,
  post: { title: string; body: string | null; forumSlug: string | null }
): boolean {
  if (!profile.threadTopics) return true;
  try {
    const topics: string[] = JSON.parse(profile.threadTopics);
    if (topics.length === 0) return true;
    const text = `${(post.title || "").toLowerCase()} ${(post.body || "").toLowerCase()}`;
    return topics.some((t) => text.includes(t.toLowerCase()));
  } catch {
    return true;
  }
}

/** Generate comment text via Claude with web search */
export async function generateComment(
  profile: AiBotProfileWithUser,
  post: { title: string; excerpt: string | null; body: string | null },
  comments: { body: string; user: { username: string } }[],
  options?: { parentComment?: { body: string; user: { username: string } } }
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const commentsText = comments
    .map((c) => `${c.user.username}: ${c.body}`)
    .join("\n\n");
  const context = options?.parentComment
    ? `\n\nThe comment you are replying to:\n${options.parentComment.user.username}: ${options.parentComment.body}`
    : "";

  const userMessage = `Thread: ${post.title}
${post.excerpt ? `Summary: ${post.excerpt}\n` : ""}
${post.body ? `Body: ${post.body}\n` : ""}
Existing comments:
${commentsText || "(none yet)"}
${context}

Write a helpful, relevant reply as this user. Use web search if you need to look up specific games, products, or events. Output plain HTML (use <p>, <strong>, <a> etc). Keep it concise (2-4 paragraphs max).`;

  const systemPrompt = `${profile.systemPrompt}

${CONTENT_GUARDRAILS}

Use web search when you need to look up games, products, or events mentioned. If you cannot find information, respond based on general knowledge and say you couldn't verify specifics.`;

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    tools: [{ type: "web_search_20250305", name: "web_search" } as const],
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const text =
    response.content
      ?.filter((block) => block.type === "text")
      .map((block) => (block as { type: "text"; text: string }).text)
      .join("") ?? "";

  return text;
}

/** Generate thread content (title, excerpt, body) via Claude */
export async function generateThread(
  profile: AiBotProfileWithUser,
  forumSlug: string,
  topicHint?: string
): Promise<{ title: string; excerpt: string; body: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const topics = profile.threadTopics
    ? JSON.parse(profile.threadTopics) || []
    : ["general betting discussion"];
  const topicsStr = Array.isArray(topics) ? topics.join(", ") : String(topics);

  const userMessage = `Create a forum thread for the "${forumSlug}" forum.
${topicHint ? `Suggested topic: ${topicHint}\n` : ""}
Your thread topics: ${topicsStr}

Output a JSON object with exactly:
{
  "title": "Clear, engaging thread title",
  "excerpt": "One-line summary",
  "body": "2-3 paragraphs of content in HTML (<p> tags)"
}

Use web search if needed to make the content accurate and relevant.`;

  const systemPrompt = `${profile.systemPrompt}

${CONTENT_GUARDRAILS}

Create an engaging forum thread. Use web search when helpful. Output only valid JSON.`;

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    tools: [{ type: "web_search_20250305", name: "web_search" } as const],
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const text =
    response.content
      ?.filter((block) => block.type === "text")
      .map((block) => (block as { type: "text"; text: string }).text)
      .join("") ?? "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  if (!parsed?.title) throw new Error("Claude did not return valid thread JSON");
  return {
    title: String(parsed.title).trim(),
    excerpt: String(parsed.excerpt || "").trim(),
    body: String(parsed.body || "").trim(),
  };
}

/** Create a thread as a bot user */
export async function createBotThread(
  botUserId: string,
  forumSlug: string,
  title: string,
  excerpt: string,
  body: string
): Promise<{ id: string; slug: string }> {
  const baseSlug = generateSlug(title) || "post";
  let slug = baseSlug;
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) {
    slug = `${baseSlug}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  }

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      type: "thread",
      authorId: botUserId,
      excerpt,
      body,
      forumSlug,
      status: "published",
    },
    select: { id: true, slug: true },
  });
  return post;
}
