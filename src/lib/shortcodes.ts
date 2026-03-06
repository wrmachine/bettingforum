/**
 * Parse article body for shortcodes: [product:slug] [casino:slug] [sportsbook:slug] [bonus:slug]
 */

const SHORTCODE_REGEX = /\[(product|casino|sportsbook|bonus):([a-zA-Z0-9_-]+)\]/g;

export type ShortcodeType = "product" | "casino" | "sportsbook" | "bonus";

export interface ShortcodeRef {
  type: ShortcodeType;
  slug: string;
  raw: string;
}

export interface BodySegment {
  type: "text" | "shortcode";
  content: string;
  shortcode?: ShortcodeRef;
}

/**
 * Split body into segments (text and shortcode). Preserves order.
 */
export function parseShortcodes(body: string): BodySegment[] {
  const segments: BodySegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const regex = new RegExp(SHORTCODE_REGEX.source, "g");
  while ((match = regex.exec(body)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", content: body.slice(lastIndex, match.index) });
    }
    const type = match[1] as ShortcodeType;
    const slug = match[2];
    segments.push({
      type: "shortcode",
      content: match[0],
      shortcode: { type, slug, raw: match[0] },
    });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < body.length) {
    segments.push({ type: "text", content: body.slice(lastIndex) });
  }
  return segments;
}

/**
 * Extract unique shortcode refs from body for fetching.
 */
export function extractShortcodeRefs(body: string): ShortcodeRef[] {
  const refs: ShortcodeRef[] = [];
  const seen = new Set<string>();
  const regex = new RegExp(SHORTCODE_REGEX.source, "g");
  let match: RegExpExecArray | null;
  while ((match = regex.exec(body)) !== null) {
    const key = `${match[1]}:${match[2]}`;
    if (!seen.has(key)) {
      seen.add(key);
      refs.push({
        type: match[1] as ShortcodeType,
        slug: match[2],
        raw: match[0],
      });
    }
  }
  return refs;
}
