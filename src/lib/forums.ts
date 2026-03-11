/**
 * Forum configuration — defines all forums on the site.
 * Each forum has a slug (used in URLs), display name, description, icon, and filter params.
 */
export type ForumIcon =
  | "globe"
  | "chart"
  | "question"
  | "hand"
  | "gift"
  | "sportsbook"
  | "casino"
  | "crypto"
  | "tool"
  | "bonus"
  | "article"
  | "nfl"
  | "nba"
  | "mlb"
  | "nhl"
  | "soccer"
  | "mma"
  | "tennis"
  | "golf"
  | "boxing"
  | "esports";

export interface ForumConfig {
  slug: string;
  name: string;
  description: string;
  icon: ForumIcon;
  category: "topic" | "product" | "bonus" | "sports" | "content";
  /** API filter: post type (article, thread, product, etc.) */
  type?: string;
  /** API filter: product type when type=product (sportsbook, casino, crypto, tool) */
  productType?: string;
  /** API filter: product slug — for bonus forums scoped to a specific product's bonuses */
  productSlug?: string;
  /** API filter: tag slug for topic forums (strategy, ama, introduce, promotions) */
  tag?: string;
  /** When true, only show posts from regular users (exclude admin/editorial content) */
  userOnly?: boolean;
}

export const FORUM_CONFIGS: ForumConfig[] = [
  // Topic Forums
  {
    slug: "bet-general",
    name: "bet/general",
    description: "General discussion about sports betting and online gambling.",
    icon: "globe",
    category: "topic",
    type: "thread",
    // No userOnly — show all threads (Reddit-style); everyone can post and see everything
  },
  {
    slug: "bet-strategy",
    name: "bet/strategy",
    description: "Strategy discussion, betting systems, and analytical approaches.",
    icon: "chart",
    category: "topic",
    type: "thread",
    tag: "strategy",
  },
  {
    slug: "bet-ama",
    name: "bet/ama",
    description: "Ask Me Anything — Q&A with experts and community members.",
    icon: "question",
    category: "topic",
    type: "thread",
    tag: "ama",
  },
  {
    slug: "bet-introduce-yourself",
    name: "bet/introduce-yourself",
    description: "New here? Introduce yourself to the community.",
    icon: "hand",
    category: "topic",
    type: "thread",
    tag: "introduce",
  },
  {
    slug: "bet-promotions",
    name: "bet/promotions",
    description: "Promos, bonuses, and special offers.",
    icon: "gift",
    category: "topic",
    type: "thread",
    tag: "promotions",
  },
  // Product Forums
  {
    slug: "bet-sportsbooks",
    name: "bet/sportsbooks",
    description: "Sportsbook reviews, comparisons, and discussions.",
    icon: "sportsbook",
    category: "product",
    type: "product",
    productType: "sportsbook",
  },
  {
    slug: "bet-casinos",
    name: "bet/casinos",
    description: "Online casino reviews and discussions.",
    icon: "casino",
    category: "product",
    type: "product",
    productType: "casino",
  },
  {
    slug: "bet-crypto",
    name: "bet/crypto",
    description: "Crypto betting sites and Bitcoin sportsbooks.",
    icon: "crypto",
    category: "product",
    type: "product",
    productType: "crypto",
  },
  {
    slug: "bet-tools",
    name: "bet/tools",
    description: "Betting tools, calculators, and tipster services.",
    icon: "tool",
    category: "product",
    type: "product",
    productType: "tool",
  },
  {
    slug: "bet-bonuses",
    name: "bet/bonuses",
    description: "Bonus offers, promo codes, and welcome deals.",
    icon: "bonus",
    category: "bonus",
    type: "bonus",
  },
  {
    slug: "bet-bonuses-first-time",
    name: "First Time",
    description: "First-time deposit bonuses and welcome offers.",
    icon: "bonus",
    category: "bonus",
    type: "bonus",
    tag: "first-time",
  },
  {
    slug: "bet-bonuses-reload",
    name: "Reload",
    description: "Reload bonuses for existing customers.",
    icon: "bonus",
    category: "bonus",
    type: "bonus",
    tag: "reload",
  },
  {
    slug: "bet-bonuses-no-deposit",
    name: "No Deposit",
    description: "No deposit bonus offers and free bets.",
    icon: "bonus",
    category: "bonus",
    type: "bonus",
    tag: "no-deposit",
  },
  // Content (Articles) — separate from Topic Forums
  {
    slug: "bet-articles",
    name: "bet/articles",
    description: "Guides, listicles, and in-depth articles.",
    icon: "article",
    category: "content",
    type: "article,listicle",
  },
  // Sports Forums
  {
    slug: "sport-nfl",
    name: "sport/nfl",
    description: "NFL and American football betting discussion.",
    icon: "nfl",
    category: "sports",
    type: "thread",
    tag: "nfl",
  },
  {
    slug: "sport-nba",
    name: "sport/nba",
    description: "NBA and basketball betting discussion.",
    icon: "nba",
    category: "sports",
    type: "thread",
    tag: "nba",
  },
  {
    slug: "sport-mlb",
    name: "sport/mlb",
    description: "MLB and baseball betting discussion.",
    icon: "mlb",
    category: "sports",
    type: "thread",
    tag: "mlb",
  },
  {
    slug: "sport-nhl",
    name: "sport/nhl",
    description: "NHL and hockey betting discussion.",
    icon: "nhl",
    category: "sports",
    type: "thread",
    tag: "nhl",
  },
  {
    slug: "sport-soccer",
    name: "sport/soccer",
    description: "Soccer, football, and international leagues betting.",
    icon: "soccer",
    category: "sports",
    type: "thread",
    tag: "soccer",
  },
  {
    slug: "sport-mma",
    name: "sport/mma",
    description: "UFC, MMA, and combat sports betting.",
    icon: "mma",
    category: "sports",
    type: "thread",
    tag: "mma",
  },
  {
    slug: "sport-tennis",
    name: "sport/tennis",
    description: "Tennis betting and Grand Slam discussion.",
    icon: "tennis",
    category: "sports",
    type: "thread",
    tag: "tennis",
  },
  {
    slug: "sport-golf",
    name: "sport/golf",
    description: "Golf and major tournament betting.",
    icon: "golf",
    category: "sports",
    type: "thread",
    tag: "golf",
  },
  {
    slug: "sport-boxing",
    name: "sport/boxing",
    description: "Boxing and fight night betting.",
    icon: "boxing",
    category: "sports",
    type: "thread",
    tag: "boxing",
  },
  {
    slug: "sport-esports",
    name: "sport/esports",
    description: "Esports, CS2, LoL, Dota 2, and gaming betting.",
    icon: "esports",
    category: "sports",
    type: "thread",
    tag: "esports",
  },
];

export function getForumBySlug(slug: string): ForumConfig | undefined {
  return FORUM_CONFIGS.find((f) => f.slug === slug);
}

/** Fetch all ForumMeta rows from DB (overrides + custom forums). */
async function getForumMetaRows() {
  try {
    const { prisma } = await import("./prisma");
    return await prisma.forumMeta.findMany();
  } catch {
    return [];
  }
}

/** Convert a custom ForumMeta DB row into a ForumConfig. */
function customMetaToConfig(row: {
  slug: string;
  name: string | null;
  description: string | null;
  icon: string | null;
  category: string | null;
  type: string | null;
  productType: string | null;
  productSlug: string | null;
  tag: string | null;
  userOnly: boolean;
}): ForumConfig {
  return {
    slug: row.slug,
    name: row.name || row.slug,
    description: row.description || "",
    icon: (row.icon as ForumIcon) || "globe",
    category: (row.category as ForumConfig["category"]) || "topic",
    type: row.type || "thread",
    productType: row.productType || undefined,
    productSlug: row.productSlug || undefined,
    tag: row.tag || undefined,
    userOnly: row.userOnly,
  };
}

/** Merge a code-defined forum config with optional DB overrides. */
export function mergeForumWithOverrides(
  forum: ForumConfig,
  overrides: Map<string, { name?: string; description?: string }>
): ForumConfig {
  const o = overrides.get(forum.slug);
  if (!o) return forum;
  return {
    ...forum,
    name: o.name?.trim() || forum.name,
    description: o.description?.trim() || forum.description,
  };
}

/** Like getForumBySlug but includes DB overrides and custom forums. */
export async function getForumBySlugWithOverrides(slug: string): Promise<ForumConfig | undefined> {
  const rows = await getForumMetaRows();

  const codeForum = getForumBySlug(slug);
  if (codeForum) {
    const row = rows.find((r) => r.slug === slug && !r.isCustom);
    if (row) {
      return {
        ...codeForum,
        name: row.name?.trim() || codeForum.name,
        description: row.description?.trim() || codeForum.description,
      };
    }
    return codeForum;
  }

  const customRow = rows.find((r) => r.slug === slug && r.isCustom);
  if (customRow) return customMetaToConfig(customRow);

  return undefined;
}

/** All forums: code-defined (with DB overrides) + custom DB forums. */
export async function getForumsWithOverrides(): Promise<ForumConfig[]> {
  const rows = await getForumMetaRows();

  const overrideMap = new Map<string, { name?: string; description?: string }>();
  const customForums: ForumConfig[] = [];

  for (const r of rows) {
    if (r.isCustom) {
      customForums.push(customMetaToConfig(r));
    } else {
      overrideMap.set(r.slug, {
        name: r.name ?? undefined,
        description: r.description ?? undefined,
      });
    }
  }

  const merged = FORUM_CONFIGS.map((f) => mergeForumWithOverrides(f, overrideMap));
  return [...merged, ...customForums];
}

export function getTopicForums(): ForumConfig[] {
  return FORUM_CONFIGS.filter((f) => f.category === "topic");
}

export function getProductForums(): ForumConfig[] {
  return FORUM_CONFIGS.filter((f) => f.category === "product");
}

export function getBonusForums(): ForumConfig[] {
  return FORUM_CONFIGS.filter((f) => f.category === "bonus");
}

export function getSportsForums(): ForumConfig[] {
  return FORUM_CONFIGS.filter((f) => f.category === "sports");
}

export function getContentForums(): ForumConfig[] {
  return FORUM_CONFIGS.filter((f) => f.category === "content");
}
