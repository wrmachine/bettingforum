import { prisma } from "@/lib/prisma";
import {
  getEnabledBotsForForumEngagement,
  getBotUserIds,
  getProductsForLinking,
  linkProductMentions,
  hasBotCommentedOnPost,
  canBotRespond,
  shouldBotRespond,
  isForumBotAllowed,
  generateComment,
  generateThread,
  createBotThread,
  type AiBotProfileWithUser,
} from "@/lib/ai-bots";
import { maybeAppendPartnerLinks } from "@/lib/partner-sportsbooks";

const SEED_LAST_RUN_KEY = "ai_bots_last_run";
const LAST_REPLY_SCAN_KEY = "ai_bots_last_reply_scan";

/** Random order so multiple bots sharing a forum take turns over time (option B). */
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export type AiBotsCronResult = {
  ok: boolean;
  responded: number;
  replies: number;
  posted: number;
  errors: string[];
  debug: Record<string, unknown>;
};

function getLastRunAt(): Promise<Date> {
  return prisma.seoSettings
    .findUnique({
      where: { key: SEED_LAST_RUN_KEY },
      select: { value: true },
    })
    .then((r) => {
      if (!r?.value) return new Date(0);
      const t = new Date(r.value).getTime();
      return isNaN(t) ? new Date(0) : new Date(t);
    });
}

async function setLastRunAt(at: Date): Promise<void> {
  await prisma.seoSettings.upsert({
    where: { key: SEED_LAST_RUN_KEY },
    create: { key: SEED_LAST_RUN_KEY, value: at.toISOString() },
    update: { value: at.toISOString() },
  });
}

function getLastReplyScan(): Promise<Date> {
  return prisma.seoSettings
    .findUnique({
      where: { key: LAST_REPLY_SCAN_KEY },
      select: { value: true },
    })
    .then((r) => {
      if (!r?.value) return new Date(0);
      const t = new Date(r.value).getTime();
      return isNaN(t) ? new Date(0) : new Date(t);
    });
}

async function setLastReplyScan(at: Date): Promise<void> {
  await prisma.seoSettings.upsert({
    where: { key: LAST_REPLY_SCAN_KEY },
    create: { key: LAST_REPLY_SCAN_KEY, value: at.toISOString() },
    update: { value: at.toISOString() },
  });
}

async function logActivity(
  botUserId: string,
  action: "comment" | "thread" | "reply",
  postId?: string,
  commentId?: string,
  dryRun?: boolean,
  errorMsg?: string
): Promise<void> {
  await prisma.aiBotActivityLog.create({
    data: {
      botUserId,
      postId: postId ?? null,
      commentId: commentId ?? null,
      action,
      dryRun: dryRun ?? false,
      errorMsg: errorMsg ?? null,
    },
  });
}

async function getProfileForBotUser(
  userId: string
): Promise<AiBotProfileWithUser | null> {
  const p = await prisma.aiBotProfile.findFirst({
    where: { userId, enabled: true },
    include: { user: { select: { id: true, username: true } } },
  });
  return p as AiBotProfileWithUser | null;
}

/** Prefer the bot being replied to; if digest-only or unavailable, use another normal bot. */
async function pickBotForReply(
  addresseeUserId: string,
  post: {
    title: string;
    body: string | null;
    excerpt: string | null;
    forumSlug: string | null;
  },
  forumEngagementBots: AiBotProfileWithUser[]
): Promise<AiBotProfileWithUser | null> {
  const addressee = await getProfileForBotUser(addresseeUserId);
  const candidates: AiBotProfileWithUser[] = [];

  if (addressee && !addressee.digestSportKey) {
    candidates.push(addressee);
  }
  const rest = shuffleArray(
    forumEngagementBots.filter((b) => b.userId !== addresseeUserId)
  );
  candidates.push(...rest);

  const seen = new Set<string>();
  const ordered = candidates.filter((b) => {
    if (seen.has(b.userId)) return false;
    seen.add(b.userId);
    return true;
  });

  for (const b of ordered) {
    if (
      !shouldBotRespond(b, {
        title: post.title,
        body: post.body,
        forumSlug: post.forumSlug,
      })
    ) {
      continue;
    }
    if (await canBotRespond(b, post.forumSlug)) {
      return b;
    }
  }
  return null;
}

export async function runAiBotsCron(options: {
  dryRun: boolean;
  forceProactive: boolean;
}): Promise<AiBotsCronResult> {
  const { dryRun, forceProactive } = options;
  const results: AiBotsCronResult = {
    ok: true,
    responded: 0,
    replies: 0,
    posted: 0,
    errors: [],
    debug: {},
  };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      ...results,
      ok: false,
      errors: ["ANTHROPIC_API_KEY not configured"],
      debug: { hint: "Add ANTHROPIC_API_KEY to .env" },
    };
  }

  const bots = await getEnabledBotsForForumEngagement();
  results.debug.botsEnabledForum = bots.length;

  if (bots.length === 0) {
    await setLastRunAt(new Date());
    await setLastReplyScan(new Date());
    results.debug.message =
      "No enabled bots for forum automation (digest-only bots do not run here)";
    results.debug.hint =
      "Create a bot with “Digest-only sport” unset, or use a non-digest-only bot";
    return results;
  }

  const allBotUserIds = await getBotUserIds();
  const botIdList = [...allBotUserIds];
  const lastRunAt = await getLastRunAt();
  const products = await getProductsForLinking();

  // Includes human- and bot-authored threads so normal bots can engage on digest / other bot posts.
  const newThreads = await prisma.post.findMany({
    where: {
      type: "thread",
      status: "published",
      createdAt: { gt: lastRunAt },
    },
    include: {
      author: { select: { username: true } },
      comments: {
        include: { user: { select: { username: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  results.debug.newThreadsSinceLastRun = newThreads.length;
  results.debug.lastRunAt = lastRunAt.toISOString();

  const maxResponsesPerRun = 3;

  for (const post of newThreads) {
    if (results.responded >= maxResponsesPerRun) break;

    const forumAllowed = await isForumBotAllowed(post.forumSlug);
    if (!forumAllowed) continue;

    const alreadyHasBot = await hasBotCommentedOnPost(post.id, allBotUserIds);
    if (alreadyHasBot) continue;

    const commentsForContext = post.comments.map((c) => ({
      body: c.body,
      user: c.user,
    }));

    const eligibleBots = shuffleArray(
      bots.filter(
        (b) =>
          b.userId !== post.authorId &&
          shouldBotRespond(b, {
            title: post.title,
            body: post.body,
            forumSlug: post.forumSlug,
          })
      )
    );

    for (const bot of eligibleBots) {
      if (results.responded >= maxResponsesPerRun) break;
      const can = await canBotRespond(bot, post.forumSlug);
      if (!can) continue;

      try {
        const rawBody = await generateComment(
          bot,
          { title: post.title, excerpt: post.excerpt, body: post.body },
          commentsForContext
        );
        let body = linkProductMentions(rawBody, products);
        body = await maybeAppendPartnerLinks(body, bot.appendPartnerLinks, "full");

        if (!dryRun) {
          const comment = await prisma.comment.create({
            data: {
              postId: post.id,
              userId: bot.userId,
              body,
            },
          });
          await logActivity(bot.userId, "comment", post.id, comment.id);
        } else {
          await logActivity(bot.userId, "comment", post.id, undefined, true);
        }
        results.responded++;
        break;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        results.errors.push(`comment on ${post.slug}: ${msg}`);
        await logActivity(bot.userId, "comment", post.id, undefined, dryRun, msg);
      }
    }
  }

  // Reply to users who @-engage bot: reply to bot comment or top-level on bot thread
  const lastReplyScan = await getLastReplyScan();
  results.debug.lastReplyScan = lastReplyScan.toISOString();

  const pendingReplies = await prisma.comment.findMany({
    where: {
      createdAt: { gt: lastReplyScan },
      userId: { notIn: botIdList },
      OR: [
        { parent: { userId: { in: botIdList } } },
        { parentId: null, post: { authorId: { in: botIdList } } },
      ],
    },
    include: {
      post: {
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          body: true,
          forumSlug: true,
          authorId: true,
        },
      },
      parent: {
        select: {
          userId: true,
          body: true,
          user: { select: { username: true } },
        },
      },
      user: { select: { username: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 8,
  });

  results.debug.pendingReplyComments = pendingReplies.length;

  const maxRepliesPerRun = 5;
  let latestProcessed: Date | null = null;

  for (const c of pendingReplies) {
    if (results.replies >= maxRepliesPerRun) break;

    const botUserId =
      c.parentId && c.parent ? c.parent.userId : c.post.authorId;

    if (!botUserId || !botIdList.includes(botUserId)) continue;

    const existingBotReply = await prisma.comment.findFirst({
      where: { parentId: c.id, userId: { in: botIdList } },
      select: { id: true },
    });
    if (existingBotReply) {
      latestProcessed = c.createdAt;
      continue;
    }

    const profile = await pickBotForReply(botUserId, c.post, bots);
    if (!profile) {
      latestProcessed = c.createdAt;
      continue;
    }

    const allComments = await prisma.comment.findMany({
      where: { postId: c.postId, parentId: null },
      include: {
        user: { select: { username: true } },
        replies: {
          include: { user: { select: { username: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const flatForContext: { body: string; user: { username: string } }[] = [];
    for (const top of allComments) {
      flatForContext.push({ body: top.body, user: top.user });
      for (const r of top.replies) {
        flatForContext.push({ body: r.body, user: r.user });
      }
    }

    const parentComment = {
      body: c.body,
      user: { username: c.user.username },
    };

    try {
      const rawBody = await generateComment(
        profile,
        {
          title: c.post.title,
          excerpt: c.post.excerpt,
          body: c.post.body,
        },
        flatForContext,
        { parentComment }
      );
      let body = linkProductMentions(rawBody, products);
      body = await maybeAppendPartnerLinks(body, profile.appendPartnerLinks, "compact");

      if (!dryRun) {
        const reply = await prisma.comment.create({
          data: {
            postId: c.postId,
            userId: profile.userId,
            parentId: c.id,
            body,
          },
        });
        await logActivity(profile.userId, "reply", c.postId, reply.id);
      } else {
        await logActivity(profile.userId, "reply", c.postId, undefined, true);
      }
      results.replies++;
      latestProcessed = c.createdAt;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.errors.push(`reply on ${c.post.slug}: ${msg}`);
      await logActivity(
        profile.userId,
        "reply",
        c.postId,
        undefined,
        dryRun,
        msg
      );
    }
  }

  if (!dryRun) {
    await setLastReplyScan(latestProcessed ?? new Date());
  }

  if (
    !dryRun &&
    (forceProactive || Math.random() < 0.15) &&
    bots.length > 0
  ) {
    const bot = bots[Math.floor(Math.random() * bots.length)] as AiBotProfileWithUser;
    const can = await canBotRespond(bot, null);
    if (can) {
      try {
        const forumSlug = bot.defaultForumSlug?.trim() || "bet-general";
        const { title, excerpt, body } = await generateThread(bot, forumSlug);
        let linkedBody = linkProductMentions(body, products);
        linkedBody = await maybeAppendPartnerLinks(
          linkedBody,
          bot.appendPartnerLinks,
          "full"
        );
        const post = await createBotThread(
          bot.userId,
          forumSlug,
          title,
          excerpt,
          linkedBody
        );
        await logActivity(bot.userId, "thread", post.id);
        results.posted++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        results.errors.push(`thread: ${msg}`);
        await logActivity(bot.userId, "thread", undefined, undefined, false, msg);
      }
    }
  }

  if (!dryRun) {
    await setLastRunAt(new Date());
  }

  return results;
}
