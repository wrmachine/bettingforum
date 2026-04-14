import { prisma } from "@/lib/prisma";

export const PARTNER_SPORTSBOOKS_KEY = "digestOutboundSportsbooks";

export type PartnerLink = { label: string; url: string };

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function getPartnerSportsbooks(): Promise<PartnerLink[]> {
  const r = await prisma.seoSettings.findUnique({
    where: { key: PARTNER_SPORTSBOOKS_KEY },
    select: { value: true },
  });
  if (!r?.value) return [];
  try {
    const parsed = JSON.parse(r.value) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: PartnerLink[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const o = item as Record<string, unknown>;
      const label = String(o.label ?? "").trim();
      let url = String(o.url ?? "").trim();
      if (!label || !url) continue;
      try {
        const u = new URL(url);
        if (u.protocol !== "http:" && u.protocol !== "https:") continue;
        url = u.href;
      } catch {
        continue;
      }
      out.push({ label, url });
    }
    return out;
  } catch {
    return [];
  }
}

/** Deterministic HTML block; do not ask the LLM to emit these URLs. */
export function renderPartnerSportsbookBlock(
  links: PartnerLink[],
  variant: "full" | "compact"
): string {
  if (!links.length) return "";
  const disclosure =
    '<p class="text-xs text-slate-500 mt-2">Some links may be affiliate links; we may earn a commission at no extra cost to you. Bet responsibly.</p>';
  const items = links
    .map(
      (l) =>
        `<li><a href="${escapeAttr(l.url)}" target="_blank" rel="noopener noreferrer">${escapeAttr(l.label)}</a></li>`
    )
    .join("");
  if (variant === "compact") {
    return `<aside class="mt-3 pt-3 border-t border-slate-200"><p class="text-sm font-medium text-slate-700">Where to bet</p><ul class="mt-1 list-inside list-disc text-sm">${items}</ul>${disclosure}</aside>`;
  }
  return `<aside class="mt-4 pt-4 border-t border-slate-200"><h3 class="text-base font-semibold text-slate-900">Where to bet</h3><ul class="mt-2 list-inside list-disc">${items}</ul>${disclosure}</aside>`;
}

export async function maybeAppendPartnerLinks(
  html: string,
  appendPartnerLinks: boolean | null | undefined,
  variant: "full" | "compact"
): Promise<string> {
  if (appendPartnerLinks === false) return html;
  const links = await getPartnerSportsbooks();
  if (!links.length) return html;
  return html + renderPartnerSportsbookBlock(links, variant);
}
