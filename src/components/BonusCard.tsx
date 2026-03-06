"use client";

import Link from "next/link";
import { useState } from "react";

export interface BonusCardProps {
  bonus: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    offerValue?: string | null;
    promoCode?: string | null;
    votes: number;
    comments: number;
    featured?: boolean;
    product?: {
      brandName: string;
      slug: string;
      siteUrl?: string | null;
      logoUrl?: string | null;
    } | null;
  };
}

export function BonusCard({ bonus }: BonusCardProps) {
  const [copied, setCopied] = useState(false);

  const copyPromo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (bonus.promoCode) {
      navigator.clipboard.writeText(bonus.promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const claimUrl = bonus.product?.siteUrl || `/bonuses/${bonus.slug}`;
  const brandName = bonus.product?.brandName ?? "Bonus";
  const bonusText = bonus.offerValue || bonus.title;

  return (
    <article className="group relative min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="flex min-h-[120px] flex-col lg:min-h-[140px] lg:flex-row">
        {/* Left: Casino logo or brand name on dark blue-gray panel (~18-20% width) */}
        <div className="flex w-full shrink-0 items-center justify-center bg-[#2D3748] px-4 py-6 lg:w-[20%] lg:min-w-[140px]">
          {bonus.product?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bonus.product.logoUrl}
              alt={brandName}
              className="max-h-12 w-full max-w-[100px] object-contain"
            />
          ) : (
            <span className="text-center text-base font-semibold text-white">
              {brandName}
            </span>
          )}
        </div>

        {/* Right: White content area - bonus centered, Play Now on right */}
        <div className="flex flex-1 flex-col gap-3 border-t border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:border-t-0 lg:border-l lg:p-5">
          {/* Center: Bonus offer and info */}
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Link href={`/bonuses/${bonus.slug}`} className="hover:opacity-90">
              <h3 className="text-base font-bold text-slate-900 lg:text-lg">
                {bonusText}
              </h3>
            </Link>
            {bonus.excerpt && (
              <p className="mt-1 text-sm text-slate-600">{bonus.excerpt}</p>
            )}
            {bonus.promoCode && (
              <div className="mt-1 flex items-center justify-center gap-2">
                <span className="font-mono text-sm font-semibold text-slate-700">{bonus.promoCode}</span>
                <button
                  type="button"
                  onClick={copyPromo}
                  className="rounded p-0.5 text-slate-500 hover:bg-slate-100 hover:text-red-600"
                  aria-label="Copy code"
                >
                  {copied ? (
                    <svg className="h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Play Now */}
          <div className="flex shrink-0 flex-col items-center justify-center lg:min-w-[120px]">
            <a
              href={claimUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-red-600 px-5 py-2.5 text-center text-sm font-bold uppercase text-white transition hover:bg-red-700"
            >
              Play Now
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
