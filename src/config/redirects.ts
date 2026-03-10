/**
 * 301 Redirect Configuration (next.config build-time)
 *
 * Admin-managed redirects are in the DB → /admin/redirects (applied via middleware).
 * This file defines code-based rules: LEGACY_REDIRECTS, WILDCARD_REDIRECTS, and
 * product-type query param redirects.
 */

export type RedirectRule = {
  source: string;
  destination: string;
  permanent?: boolean;
  has?: { type: "query" | "header" | "cookie"; key: string; value: string }[];
};

/** Simple path-to-path mappings (in-code, build-time). For admin-managed, use /admin/redirects. */
export const LEGACY_REDIRECTS: Array<{ from: string; to: string }> = [
  // ─── Example migrations (replace with your actual old→new mappings) ───
  // { from: "/forum", to: "/f/bet-general" },
  // { from: "/forum/sports-betting", to: "/f/bet-sportsbooks" },
  // { from: "/thread/:id", to: "/threads/:id" },  // use :path* for dynamic segments
  // { from: "/viewtopic.php", to: "/threads" },   // phpBB-style
  // { from: "/index.php/forum", to: "/f/bet-general" },
];

/** Wildcard / catch-all redirects. Source supports :path* (captures remainder). */
export const WILDCARD_REDIRECTS: RedirectRule[] = [
  // ─── Example: redirect all /old-prefix/* to /new-prefix/* ───
  // { source: "/old-prefix/:path*", destination: "/new-prefix/:path*", permanent: true },
];

/** Product type query param redirects (existing). */
const PRODUCT_TYPE_REDIRECTS: RedirectRule[] = [
  {
    source: "/products",
    has: [{ type: "query", key: "type", value: "sportsbook" }],
    destination: "/f/bet-sportsbooks",
    permanent: true,
  },
  {
    source: "/products",
    has: [{ type: "query", key: "type", value: "casino" }],
    destination: "/f/bet-casinos",
    permanent: true,
  },
  {
    source: "/products",
    has: [{ type: "query", key: "type", value: "crypto" }],
    destination: "/f/bet-crypto",
    permanent: true,
  },
  {
    source: "/products",
    has: [{ type: "query", key: "type", value: "tool" }],
    destination: "/f/bet-tools",
    permanent: true,
  },
];

/** Convert our rule format to Next.js redirect format. */
function toNextRedirect(rule: RedirectRule) {
  return {
    source: rule.source,
    destination: rule.destination,
    permanent: rule.permanent ?? true,
    ...(rule.has && rule.has.length > 0 && { has: rule.has }),
  };
}

type NextRedirect = ReturnType<typeof toNextRedirect>;

/** Build all redirects for Next.js config. */
export function buildRedirects(): NextRedirect[] {
  const rules: NextRedirect[] = [];

  // 1. Legacy simple path mappings (in-code)
  for (const { from, to } of LEGACY_REDIRECTS) {
    rules.push(
      toNextRedirect({
        source: from,
        destination: to,
        permanent: true,
      })
    );
  }

  // 2. Wildcard redirects
  rules.push(...WILDCARD_REDIRECTS.map(toNextRedirect));

  // 3. Product type query param redirects
  rules.push(...PRODUCT_TYPE_REDIRECTS.map(toNextRedirect));

  return rules;
}
