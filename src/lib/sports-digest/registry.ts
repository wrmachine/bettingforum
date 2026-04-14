export type SportDigestEntry = {
  sportKey: string;
  forumSlug: string;
  tagSlug: string;
  displayName: string;
};

/**
 * Must stay in sync with sports forums in `src/lib/forums.ts` (sport-* slugs + tag).
 * Enable/disable per sport is admin-controlled in digest state.
 */
export const SPORT_DIGEST_REGISTRY: SportDigestEntry[] = [
  {
    sportKey: "nfl",
    forumSlug: "sport-nfl",
    tagSlug: "nfl",
    displayName: "NFL",
  },
  {
    sportKey: "nba",
    forumSlug: "sport-nba",
    tagSlug: "nba",
    displayName: "NBA",
  },
  {
    sportKey: "mlb",
    forumSlug: "sport-mlb",
    tagSlug: "mlb",
    displayName: "MLB",
  },
  {
    sportKey: "nhl",
    forumSlug: "sport-nhl",
    tagSlug: "nhl",
    displayName: "NHL",
  },
  {
    sportKey: "soccer",
    forumSlug: "sport-soccer",
    tagSlug: "soccer",
    displayName: "Soccer",
  },
  {
    sportKey: "mma",
    forumSlug: "sport-mma",
    tagSlug: "mma",
    displayName: "MMA",
  },
  {
    sportKey: "tennis",
    forumSlug: "sport-tennis",
    tagSlug: "tennis",
    displayName: "Tennis",
  },
  {
    sportKey: "golf",
    forumSlug: "sport-golf",
    tagSlug: "golf",
    displayName: "Golf",
  },
  {
    sportKey: "boxing",
    forumSlug: "sport-boxing",
    tagSlug: "boxing",
    displayName: "Boxing",
  },
  {
    sportKey: "esports",
    forumSlug: "sport-esports",
    tagSlug: "esports",
    displayName: "Esports",
  },
];
