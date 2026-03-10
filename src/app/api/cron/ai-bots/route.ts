import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getEnabledBots,
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

const SEED_LAST_RUN_KEY = "ai_bots_last_run";

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

async function logActivity(
  botUserId: string,
  action: "comment" | "thread",
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

export async function GET(request: NextRequest) {
  const isLocal =
    process.env.NODE_ENV === "development" ||
    /localhost|127\.0\.0\.1/.test(process.env.NEXTAUTH_URL ?? "");
  const secret = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "")
    ?? request.headers.get("x-cron-secret");
  const expected = process.env.CRON_SECRET;
  if (!isLocal && (!expected || secret !== expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dryRun = request.nextUrl.searchParams.get("dryRun") === "1";
  const forceProactive = request.nextUrl.searchParams.get("force") === "1";
  const results = {
    responded: 0,
    posted: 0,
    errors: [] as string[],
    debug: {} as Record<string, unknown>,
  };

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured", hint: "Add ANTHROPIC_API_KEY to .env" },
        { status: 503 }
      );
    }

    const bots = await getEnabledBots();
    results.debug.botsEnabled = bots.length;

    if (bots.length === 0) {
      await setLastRunAt(new Date());
      return NextResponse.json({
        ok: true,
        ...results,
        message: "No enabled bots",
        hint: "Create an AI bot in Admin → AI Bots and enable it",
      });
    }

    const botUserIds = await getBotUserIds();
    const lastRunAt = await getLastRunAt();
    const products = await getProductsForLinking();

    // Find new threads since last run (exclude bot-authored)
    const newThreads = await prisma.post.findMany({
      where: {
        type: "thread",
        status: "published",
        createdAt: { gt: lastRunAt },
        authorId: { notIn: [...botUserIds] },
      },
      include: {
        author: { select: { username: true } },
        comments: {
          include: { user: { select: { username: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    results.debug.newThreadsSinceLastRun = newThreads.length;
    results.debug.lastRunAt = lastRunAt.toISOString();

    const respondedPostIds = new Set<string>();
    const maxResponsesPerRun = 3;

    for (const post of newThreads) {
      if (results.responded >= maxResponsesPerRun) break;

      const forumAllowed = await isForumBotAllowed(post.forumSlug);
      if (!forumAllowed) continue;

      const alreadyHasBot = await hasBotCommentedOnPost(post.id, botUserIds);
      if (alreadyHasBot) continue;

      const commentsForContext = post.comments.map((c) => ({
        body: c.body,
        user: c.user,
      }));

      const eligibleBots = bots.filter(
        (b) =>
          shouldBotRespond(b, {
            title: post.title,
            body: post.body,
            forumSlug: post.forumSlug,
          })
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
          const body = linkProductMentions(rawBody, products);

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
          respondedPostIds.add(post.id);
          break; // One bot per thread per run
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          results.errors.push(`comment on ${post.slug}: ${msg}`);
          await logActivity(bot.userId, "comment", post.id, undefined, dryRun, msg);
        }
      }
    }

    // Proactive thread: 100% when ?force=1, else ~15% chance
    if (!dryRun && (forceProactive || Math.random() < 0.15) && bots.length > 0) {
      const bot = bots[Math.floor(Math.random() * bots.length)] as AiBotProfileWithUser;
      const can = await canBotRespond(bot, null);
      if (can) {
        try {
          const forumSlug = "bet-general"; // Default forum for proactive
          const { title, excerpt, body } = await generateThread(bot, forumSlug);
          const linkedBody = linkProductMentions(body, products);
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
  } catch (err) {
    console.error("AI bots cron error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Cron failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, ...results });
}
