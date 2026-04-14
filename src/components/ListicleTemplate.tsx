import Link from "next/link";
import { CouponCopyButton } from "./CouponCopyButton";

interface ListicleItemData {
  position: number;
  note: string | null;
  product: {
    id: string;
    brandName: string;
    shortDescription?: string | null;
    bonusSummary?: string | null;
    minDeposit?: string | null;
    logoUrl?: string | null;
    siteUrl?: string | null;
    productType?: string | null;
    licenseJurisdiction?: string | null;
    post: { slug: string };
    bonuses?: { promoCode: string | null; featured: boolean }[];
    reviews?: { rating: number }[];
  };
}

interface ListicleTemplateProps {
  items: ListicleItemData[];
}

function ratingOutOf10(reviews: { rating: number }[] | undefined): number | null {
  if (!reviews?.length) return null;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return Math.max(1, Math.min(10, Math.round((avg / 5) * 10)));
}

function firstPromoCode(bonuses: { promoCode: string | null }[] | undefined): string | null {
  const code = bonuses?.find((b) => b.promoCode?.trim())?.promoCode?.trim();
  return code ?? null;
}

/** Turn listicle HTML/plain text into plain feature lines with leading "+" in the UI. */
function parseFeatureLines(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  if (/<li/i.test(trimmed)) {
    const matches = trimmed.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
    if (matches?.length) {
      return matches.map((m) => m.replace(/<[^>]+>/g, "").trim()).filter(Boolean);
    }
  }
  const fromP = trimmed.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
  if (fromP?.length) {
    return fromP.map((p) => p.replace(/<[^>]+>/g, "").trim()).filter(Boolean);
  }
  return trimmed
    .split(/\n|<br\s*\/?>/i)
    .map((s) => s.replace(/<[^>]+>/g, "").trim())
    .filter(Boolean);
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

/**
 * Listicle row: top bar (logo, rating, CTA), bonus + coupon row, + feature lines.
 */
export function ListicleTemplate({ items }: ListicleTemplateProps) {
  return (
    <section className="flex flex-col gap-0">
      {items.length === 0 ? (
        <p className="rounded-none border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-slate-500">
          No items in this list yet. Add products via Edit listicle.
        </p>
      ) : (
        items.map((item, index) => {
          const productUrl = item.product.siteUrl || `/products/${item.product.post.slug}`;
          const isExternal = !!item.product.siteUrl;
          const bonusText = item.product.bonusSummary ?? item.product.brandName;
          const score = ratingOutOf10(item.product.reviews);
          const promo = firstPromoCode(item.product.bonuses);
          const featureLines = item.product.shortDescription
            ? parseFeatureLines(item.product.shortDescription)
            : [];

          return (
            <article
              key={item.product.id}
              className={`min-w-0 overflow-hidden rounded-none border border-slate-200 bg-white transition hover:opacity-95 ${index > 0 ? "border-t-0" : ""}`}
            >
              {/* Top: mobile = logo stacked above Play Now; sm+ = logo + rating | button */}
              <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex min-w-0 w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
                  <div className="relative h-16 w-full shrink-0 overflow-hidden bg-black sm:h-[4.5rem] sm:w-[14rem]">
                    {item.product.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.product.logoUrl}
                        alt={item.product.brandName}
                        className="absolute inset-0 size-full object-cover object-center"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center px-2 text-center text-xs font-semibold uppercase text-white">
                        {item.product.brandName}
                      </span>
                    )}
                  </div>
                  {score !== null && (
                    <div className="hidden items-center gap-1.5 text-sm text-slate-500 sm:flex">
                      <StarIcon className="h-5 w-5 text-orange-500" />
                      <span>
                        <span className="font-semibold text-slate-800">{score}</span>
                        <span className="text-slate-400">/10</span>
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex w-full shrink-0 sm:w-auto">
                  {isExternal ? (
                    <a
                      href={productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full rounded-none bg-orange-500 px-6 py-2.5 text-center text-sm font-bold uppercase tracking-wide text-white transition hover:bg-orange-600 sm:w-auto"
                    >
                      Play Now
                    </a>
                  ) : (
                    <Link
                      href={productUrl}
                      className="block w-full rounded-none bg-orange-500 px-6 py-2.5 text-center text-sm font-bold uppercase tracking-wide text-white transition hover:bg-orange-600 sm:w-auto"
                    >
                      Play Now
                    </Link>
                  )}
                </div>
              </div>

              {/* Bonus headline + coupon */}
              <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <h3 className="text-lg font-bold leading-snug text-slate-900">{bonusText}</h3>
                {promo && (
                  <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
                    <span className="text-sm text-slate-500">Coupon</span>
                    <span className="border-b border-dotted border-orange-500 text-base font-semibold text-orange-500">
                      {promo}
                    </span>
                    <CouponCopyButton code={promo} />
                  </div>
                )}
              </div>

              {/* Features */}
              {featureLines.length > 0 && (
                <div className="space-y-2.5 px-4 py-4">
                  {featureLines.map((line, i) => (
                    <div key={i} className="flex gap-2 text-sm leading-relaxed text-slate-700">
                      <span className="shrink-0 select-none font-bold text-orange-500">+</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })
      )}
    </section>
  );
}
