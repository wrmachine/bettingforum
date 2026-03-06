"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { stripHtml } from "@/lib/format";
import { AdminEditButton } from "./AdminEditButton";
import { ReviewCard } from "./ReviewCard";
import { CommentThread } from "./CommentThread";
import { AccountWidget } from "./AccountWidget";
import { AdSlot } from "./AdSlot";
import { QuickInfoPaymentMethods } from "./QuickInfoPaymentMethods";
import { ArticleFillerContent } from "./ArticleFillerContent";
import { TheVerdict } from "./TheVerdict";
import { ProsCons } from "./ProsCons";
import { ProductFAQ } from "./ProductFAQ";
import { RatingCtaBar } from "./RatingCtaBar";

function getRatingLabel(rating: number): string {
  if (rating >= 4.5) return "Excellent";
  if (rating >= 4) return "Very Good";
  if (rating >= 3) return "Good";
  if (rating >= 2) return "Fair";
  return "Poor";
}

interface ProductDetailProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    body: string | null;
    type: string;
    author: { username: string };
    product?: {
      id?: string;
      brandName: string;
      siteUrl: string | null;
      productType: string;
      licenseJurisdiction: string | null;
      geoRestrictions: string | null;
      fiatSupported: boolean;
      cryptoSupported: boolean;
      bonusSummary: string | null;
      minDeposit: string | null;
      logoUrl?: string | null;
      media?: string | null;
      bankingMethods?: string | null;
      cryptoMethods?: string | null;
      acceptedCurrencies?: string | null;
      reviews?: { rating: number }[];
    };
    votes: number;
    comments: number;
    tags: { name: string }[];
  };
}

export function ProductDetail({ post }: ProductDetailProps) {
  const { data: session } = useSession();
  const product = post.product;
  if (!product) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-800">
        This product is missing details. Please try another page.
      </div>
    );
  }
  const logoUrl = product.logoUrl;
  const reviews = product.reviews ?? [];
  const reviewCount = reviews.length;
  const avgRating =
    reviewCount > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviewCount) * 10) / 10
      : null;
  const fullStars = avgRating != null ? Math.floor(avgRating) : 0;
  const hasHalfStar = avgRating != null && avgRating % 1 >= 0.25 && avgRating % 1 < 0.75;
  const visitUrl = product.siteUrl || `/products/${post.slug}`;
  const isExternal = !!product.siteUrl;

  return (
    <div className="flex flex-col gap-8">
      {/* Row 1: Hero – full width */}
      <section className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
        <div className="flex flex-col gap-6 p-8 sm:flex-row sm:items-stretch sm:gap-8">
          <div className="flex w-full shrink-0 sm:w-64">
            <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-slate-100">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={`${post.title} logo`}
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <span className="text-5xl font-bold text-slate-600 sm:text-6xl">
                  {post.title.charAt(0)}
                </span>
              )}
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
              {post.excerpt && <p className="mt-2 text-gray-600">{stripHtml(post.excerpt)}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                {product.licenseJurisdiction && (
                  <span className="flex items-center gap-1">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    {product.licenseJurisdiction}
                  </span>
                )}
                <span>{reviewCount} review{reviewCount !== 1 ? "s" : ""}</span>
                <span>{post.votes} votes</span>
                <span>{post.comments} comments</span>
                <span>by {post.author.username}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {post.tags?.map((t) => (
                  <span
                    key={t.name}
                    className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-600"
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-4 sm:flex-row lg:flex-col lg:items-end">
            <div className="flex w-full flex-col gap-2 sm:w-auto lg:w-48">
              <AdminEditButton type="product" slug={post.slug} className="w-full sm:w-auto" />
            <div className="w-full rounded-xl bg-slate-100 px-6 py-4 sm:w-auto">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  {avgRating ?? "—"}
                </span>
                <span className="text-sm text-gray-500">
                  {avgRating != null ? getRatingLabel(avgRating) : "No reviews"}
                </span>
              </div>
              {avgRating != null && (
                <div className="mt-1 text-accent">
                  {"★".repeat(fullStars)}
                  {hasHalfStar ? "½" : ""}
                  {"☆".repeat(5 - fullStars - (hasHalfStar ? 1 : 0))}
                </div>
              )}
              <div className="mt-1 text-xs text-gray-500">
                Based on {reviewCount} review{reviewCount !== 1 ? "s" : ""}
              </div>
            </div>
            <a
              href={visitUrl}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 font-medium text-white transition hover:bg-accent-hover sm:w-auto"
            >
              Visit {post.title}
              {isExternal && (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              )}
            </a>
            </div>
          </div>
        </div>
      </section>
      {/* Row 2: Two columns – main content (left) and sidebar (right) */}
      <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-[1fr_16rem]">
        <div className="min-w-0 space-y-8">
          <QuickInfoPaymentMethods
            minDeposit={product.minDeposit}
            licenseJurisdiction={product.licenseJurisdiction}
            geoRestrictions={product.geoRestrictions}
            cryptoMethodsJson={product.cryptoMethods}
            cryptoSupported={product.cryptoSupported}
            productType={product.productType}
          />
      <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
        <div className="px-8 pb-8 pt-8">
          {post.body?.trim() ? (
            <div
              className="prose prose-lg max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-800 prose-p:mb-4 prose-p:leading-relaxed prose-ul:text-gray-800 prose-li:text-gray-800 prose-li:my-1 prose-ul:my-4 prose-strong:text-gray-900 prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-200 prose-h3:mt-6 prose-h3:mb-3 prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:bg-slate-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:my-6 prose-blockquote:text-gray-700 prose-hr:my-8 prose-h1:mt-0 prose-h1:mb-6 prose-em:text-gray-800 prose-table:text-gray-800 prose-th:bg-slate-100 prose-th:px-4 prose-th:py-2 prose-td:px-4 prose-td:py-2 prose-img:rounded-lg prose-a:text-accent prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: post.body }}
            />
          ) : (
            <ArticleFillerContent />
          )}
        </div>
      </article>

      <TheVerdict productName={post.title} />

      <ProsCons />

      <ProductFAQ />

      <RatingCtaBar
        productName={post.title}
        avgRating={avgRating}
        reviewCount={reviewCount}
        visitUrl={visitUrl}
        isExternal={isExternal}
      />

      <section id="write-review" className="rounded-xl border border-slate-200 bg-white p-8 shadow-lg scroll-mt-24">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">User Reviews</h2>
          {session ? (
            <a
              href="#write-review"
              className="rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-slate-200"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("write-review")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              Write a Review
            </a>
          ) : (
            <Link
              href="/auth/sign-in"
              className="rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-slate-200"
            >
              Write a Review
            </Link>
          )}
        </div>
        <ReviewCard productId={product?.id} postId={post.id} />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900">Leave a Comment</h2>
        <CommentThread
          postId={post.id}
          postSlug={post.slug}
          placeholder={`Share your experience with ${post.title}...`}
          submitLabel="Post Comment"
        />
      </section>
        </div>
        <aside className="flex w-64 shrink-0 flex-col gap-6">
          <AccountWidget />
          <AdSlot
            slot="product_sidebar"
            className="min-h-[200px] w-full"
            fallback={
              <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
                <span className="text-sm text-slate-400">Ad spot 1</span>
              </div>
            }
          />
        </aside>
      </div>
    </div>
  );
}
