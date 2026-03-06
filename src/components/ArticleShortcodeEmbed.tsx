"use client";

import Link from "next/link";
import type { ResolvedProduct, ResolvedBonus } from "@/lib/shortcode-resolve";

export function ArticleProductEmbed({ product }: { product: ResolvedProduct }) {
  const url = product.siteUrl || `/products/${product.slug}`;
  const isExternal = !!product.siteUrl;
  const bonusText = product.bonusSummary || product.excerpt?.split(/[.•]/)[0]?.trim() || product.title;

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex min-h-[90px] flex-col sm:flex-row sm:items-center">
        <div className="flex w-full shrink-0 items-center justify-center bg-[#2D3748] px-4 py-4 sm:w-24">
          {product.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.logoUrl}
              alt={product.title}
              className="max-h-10 max-w-[80px] object-contain"
            />
          ) : (
            <span className="text-sm font-semibold text-white">{product.title}</span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="font-semibold text-slate-900">{bonusText}</h4>
            <p className="text-sm text-slate-600">{product.title}</p>
          </div>
          {isExternal ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-lg bg-red-600 px-4 py-2 text-center text-sm font-bold text-white hover:bg-red-700"
            >
              Visit
            </a>
          ) : (
            <Link
              href={`/products/${product.slug}`}
              className="shrink-0 rounded-lg bg-red-600 px-4 py-2 text-center text-sm font-bold text-white hover:bg-red-700"
            >
              Visit
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function ArticleBonusEmbed({ bonus }: { bonus: ResolvedBonus }) {
  const claimUrl = bonus.product?.siteUrl || `/bonuses/${bonus.slug}`;
  const brandName = bonus.product?.brandName ?? "Bonus";
  const bonusText = bonus.offerValue || bonus.title;

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex min-h-[90px] flex-col sm:flex-row sm:items-center">
        <div className="flex w-full shrink-0 items-center justify-center bg-[#2D3748] px-4 py-4 sm:w-24">
          {bonus.product?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bonus.product.logoUrl}
              alt={brandName}
              className="max-h-10 max-w-[80px] object-contain"
            />
          ) : (
            <span className="text-sm font-semibold text-white">{brandName}</span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="font-semibold text-slate-900">{bonusText}</h4>
            {bonus.promoCode && (
              <p className="text-sm text-slate-600">
                Code: <span className="font-mono font-medium">{bonus.promoCode}</span>
              </p>
            )}
          </div>
          <a
            href={claimUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg bg-red-600 px-4 py-2 text-center text-sm font-bold text-white hover:bg-red-700"
          >
            Claim
          </a>
        </div>
      </div>
    </div>
  );
}
