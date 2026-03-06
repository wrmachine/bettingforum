import Link from "next/link";

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
  };
}

interface ListicleTemplateProps {
  items: ListicleItemData[];
}

/**
 * Reusable listicle layout – sportsbook card design with brand panel, bonus, features, and CTA.
 */
export function ListicleTemplate({ items }: ListicleTemplateProps) {
  return (
    <section className="flex flex-col gap-4">
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-slate-500">
          No items in this list yet. Add products via Edit listicle.
        </p>
      ) : (
        items.map((item) => {
          const productUrl = item.product.siteUrl || `/products/${item.product.post.slug}`;
          const isExternal = !!item.product.siteUrl;
          const bonusText = item.product.bonusSummary ?? item.product.brandName;

          return (
            <article
              key={item.product.id}
              className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:opacity-95"
            >
              <div className="flex min-h-[120px] flex-col lg:min-h-[140px] lg:flex-row">
                {/* Left: Logo fills dark blue section - no inner box/padding, centered, stretch to fill */}
                <div className="relative flex w-full shrink-0 self-stretch lg:w-[20%] lg:min-w-[140px]">
                  {item.product.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.product.logoUrl}
                      alt={item.product.brandName}
                      className="absolute inset-0 size-full object-contain object-center"
                    />
                  ) : (
                    <span className="flex flex-1 items-center justify-center text-center text-base font-semibold text-slate-700">
                      {item.product.brandName}
                    </span>
                  )}
                </div>

                {/* Right: White content area - bonus centered, Play Now on right */}
                <div className="flex flex-1 flex-col gap-3 border-t border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:border-t-0 lg:border-l lg:p-5">
                  {/* Center: Bonus offer and info */}
                  <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <h3 className="text-base font-bold text-slate-900 lg:text-lg">
                      {bonusText}
                    </h3>
                    {item.product.shortDescription && (
                      <p className="mt-1 text-sm text-slate-600">{item.product.shortDescription}</p>
                    )}
                  </div>

                  {/* Play Now */}
                  <div className="flex shrink-0 flex-col items-center justify-center lg:min-w-[120px]">
                    {isExternal ? (
                      <a
                        href={productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-red-600 px-5 py-2.5 text-center text-sm font-bold uppercase text-white transition hover:bg-red-700"
                      >
                        Play Now
                      </a>
                    ) : (
                      <Link
                        href={productUrl}
                        className="rounded-lg bg-red-600 px-5 py-2.5 text-center text-sm font-bold uppercase text-white transition hover:bg-red-700"
                      >
                        Play Now
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })
      )}
    </section>
  );
}
