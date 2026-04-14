import { prisma } from "@/lib/prisma";
import type { AiBotProfileWithUser } from "@/lib/ai-bots";
import { getDigestState, setDigestState, utcDateString } from "@/lib/sports-digest/state";
import { SPORT_DIGEST_REGISTRY } from "@/lib/sports-digest/registry";
import { generateSportDailyDigest } from "@/lib/sports-digest/generate-daily-digest";
import { createDigestPost } from "@/lib/sports-digest/create-digest-post";
import { maybeAppendPartnerLinks } from "@/lib/partner-sportsbooks";
import { isForumBotAllowed } from "@/lib/ai-bots";

function parseAllowedForums(json: string | null): string[] {
  if (!json) return [];
  try {
    const a = JSON.parse(json) as unknown;
    return Array.isArray(a) ? a.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

async function findDigestBotForSport(
  sportKey: string,
  forumSlug: string
): Promise<AiBotProfileWithUser | null> {
  const profiles = await prisma.aiBotProfile.findMany({
    where: { enabled: true },
    include: { user: { select: { id: true, username: true } } },
  });
  const asUser = (p: (typeof profiles)[0]) => p as AiBotProfileWithUser;

  const dedicated = profiles.find((p) => p.digestSportKey === sportKey);
  if (dedicated) return asUser(dedicated);

  const pool = profiles.filter((p) => p.digestSportKey == null);
  const explicit = pool.find((p) =>
    parseAllowedForums(p.allowedForums).includes(forumSlug)
  );
  if (explicit) return asUser(explicit);
  const fallback = pool.find(
    (p) =>
      p.allowedForums == null || parseAllowedForums(p.allowedForums).length === 0
  );
  return fallback ? asUser(fallback) : null;
}

export type SportsDigestCronResult = {
  ok: boolean;
  posted: string[];
  skipped: string[];
  errors: string[];
  debug: Record<string, unknown>;
};

export async function runSportsDigestCron(options: {
  dryRun: boolean;
  force: boolean;
}): Promise<SportsDigestCronResult> {
  const { dryRun, force } = options;
  const result: SportsDigestCronResult = {
    ok: true,
    posted: [],
    skipped: [],
    errors: [],
    debug: {},
  };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      ...result,
      ok: false,
      errors: ["ANTHROPIC_API_KEY not configured"],
    };
  }

  const state = await getDigestState();
  const today = utcDateString(new Date());
  result.debug.todayUtc = today;

  for (const entry of SPORT_DIGEST_REGISTRY) {
    const enabled = state.enabled[entry.sportKey] !== false;
    if (!enabled) {
      result.skipped.push(`${entry.sportKey}: disabled in admin`);
      continue;
    }

    const last = state.lastDigestDate[entry.sportKey];
    if (!force && last === today) {
      result.skipped.push(`${entry.sportKey}: already posted for ${today}`);
      continue;
    }

    if (!(await isForumBotAllowed(entry.forumSlug))) {
      result.skipped.push(`${entry.sportKey}: forum is human-only`);
      continue;
    }

    const bot = await findDigestBotForSport(entry.sportKey, entry.forumSlug);
    if (!bot) {
      result.skipped.push(
        `${entry.sportKey}: no enabled bot with access to ${entry.forumSlug} (set Allowed Forums on a bot)`
      );
      continue;
    }

    try {
      const { title, excerpt, bodyHtml } = await generateSportDailyDigest(
        bot,
        entry,
        today
      );
      let body = bodyHtml;
      body = await maybeAppendPartnerLinks(body, bot.appendPartnerLinks, "full");

      if (!dryRun) {
        const post = await createDigestPost(
          bot.userId,
          entry.forumSlug,
          title,
          excerpt,
          body,
          entry.tagSlug
        );
        await prisma.aiBotActivityLog.create({
          data: {
            botUserId: bot.userId,
            postId: post.id,
            action: "digest",
            dryRun: false,
          },
        });
        result.posted.push(`${entry.sportKey}: /threads/${post.slug}`);
        const next: typeof state = {
          ...state,
          lastDigestDate: {
            ...state.lastDigestDate,
            [entry.sportKey]: today,
          },
        };
        await setDigestState(next);
      } else {
        result.posted.push(`${entry.sportKey}: dry-run only`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      result.errors.push(`${entry.sportKey}: ${msg}`);
    }
  }

  return result;
}
