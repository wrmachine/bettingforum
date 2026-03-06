"use client";

import Link from "next/link";
import { stripHtml } from "@/lib/format";

export interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    productType?: string;
    bonusSummary?: string | null;
    siteUrl?: string | null;
    votes: number;
    comments: number;
    tags: string[];
    logoUrl?: string | null;
    rating?: number | null;
    reviewCount?: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const playUrl = product.siteUrl || `/products/${product.slug}`;
  const isExternal = !!product.siteUrl;

  const bonusText = product.bonusSummary || product.excerpt?.split(/[.•]/)[0]?.trim() || product.title;

  return (
    <article className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="flex min-h-[120px] flex-col lg:min-h-[140px] lg:flex-row lg:items-center">
        {/* Left: Logo area 160×100 */}
        <div className="grid h-[100px] w-[160px] shrink-0 place-items-center overflow-hidden p-[5px] self-center lg:self-auto">
          {product.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.logoUrl}
              alt={product.title}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <span className="text-center text-base font-semibold text-slate-700">
              {product.title}
            </span>
          )}
        </div>

        {/* Right: White content area - bonus centered, Rating + Play Now on right */}
        <div className="flex flex-1 flex-col gap-3 border-t border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:border-t-0 lg:border-l lg:p-5">
          {/* Center: Bonus offer and info */}
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <h3 className="text-base font-bold text-slate-900 lg:text-lg">
              {bonusText}
            </h3>
            {product.excerpt && (
              <p className="mt-1 text-sm text-slate-600">{stripHtml(product.excerpt)}</p>
            )}
          </div>

          {/* Play Now + Review */}
          <div className="flex shrink-0 flex-col items-center justify-center gap-2 lg:min-w-[120px]">
            {isExternal ? (
              <a
                href={playUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-red-600 px-5 py-2.5 text-center text-sm font-bold uppercase text-white transition hover:bg-red-700"
              >
                Play Now
              </a>
            ) : (
              <Link
                href={`/products/${product.slug}`}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-center text-sm font-bold uppercase text-white transition hover:bg-red-700"
              >
                Play Now
              </Link>
            )}
            <Link
              href={`/products/${product.slug}#reviews`}
              className="text-xs text-slate-600 underline hover:text-red-600"
              onClick={(e) => e.stopPropagation()}
            >
              Review
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
