"use client";

import Link from "next/link";
import { stripHtml } from "@/lib/format";
import { useState } from "react";
import { CommentThread } from "./CommentThread";
import { AdminEditButton } from "./AdminEditButton";

interface BonusDetailProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    body: string | null;
    type: string;
    author: { username: string };
    bonus?: {
      offerValue: string | null;
      promoCode: string | null;
      terms: string | null;
      claimUrl: string | null;
      expiresAt: string | null;
      product?: {
        brandName: string;
        siteUrl: string | null;
        logoUrl?: string | null;
        post: { slug: string };
      } | null;
    } | null;
    votes: number;
    comments: number;
    tags: { name: string }[];
  };
}

export function BonusDetail({ post }: BonusDetailProps) {
  const [copied, setCopied] = useState(false);
  const bonus = post.bonus;

  const copyPromo = () => {
    if (bonus?.promoCode) {
      navigator.clipboard.writeText(bonus.promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const claimUrl = bonus?.claimUrl || bonus?.product?.siteUrl;

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <AdminEditButton type="bonus" slug={post.slug} />
      </div>
      <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="flex gap-6">
          <div className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl ${bonus?.product?.logoUrl ? "bg-slate-100" : "bg-accent/10"}`}>
            {bonus?.product?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={bonus.product.logoUrl}
                alt={bonus.product.brandName}
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-2xl font-bold text-accent">
                {post.title.charAt(0)}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
            {post.excerpt && (
              <p className="mt-2 text-gray-600">{stripHtml(post.excerpt)}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags?.map((t) => (
                <span
                  key={t.name}
                  className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-600"
                >
                  {t.name}
                </span>
              ))}
            </div>
            <div className="mt-4 flex gap-4 text-sm text-gray-500">
              <span>{post.votes} votes</span>
              <span>{post.comments} comments</span>
              <span>by {post.author.username}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-8">
          <h2 className="text-lg font-semibold text-gray-900">Bonus Details</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            {bonus?.offerValue && (
              <div>
                <dt className="text-sm text-gray-500">Offer</dt>
                <dd className="text-lg font-semibold text-accent">{bonus.offerValue}</dd>
              </div>
            )}
            {bonus?.product && (
              <div>
                <dt className="text-sm text-gray-500">Brand</dt>
                <dd>
                  <Link
                    href={`/products/${bonus.product.post.slug}`}
                    className="font-medium text-accent hover:underline"
                  >
                    {bonus.product.brandName}
                  </Link>
                </dd>
              </div>
            )}
            {bonus?.promoCode && (
              <div className="sm:col-span-2">
                <dt className="text-sm text-gray-500">Promo Code</dt>
                <dd className="mt-1 flex items-center gap-2">
                  <span className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 font-mono font-medium">
                    {bonus.promoCode}
                  </span>
                  <button
                    type="button"
                    onClick={copyPromo}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </dd>
              </div>
            )}
            {bonus?.expiresAt && (
              <div>
                <dt className="text-sm text-gray-500">Expires</dt>
                <dd className="font-medium">
                  {new Date(bonus.expiresAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </dd>
              </div>
            )}
            {bonus?.terms && (
              <div className="sm:col-span-2">
                <dt className="text-sm text-gray-500">Terms & Conditions</dt>
                <dd className="mt-1 text-sm text-gray-600">{bonus.terms}</dd>
              </div>
            )}
          </dl>

          {claimUrl && (
            <div className="mt-6">
              <a
                href={claimUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-lg bg-accent px-6 py-3 text-center font-bold text-white transition hover:bg-accent-hover"
              >
                Claim Bonus
              </a>
            </div>
          )}
        </div>

        {post.body && (
          <div className="mt-8 border-t border-gray-100 pt-8">
            <h2 className="text-lg font-semibold text-gray-900">Description</h2>
            <div
              className="article-prose mt-4 prose prose-slate prose-lg max-w-none text-slate-700 prose-headings:font-semibold prose-headings:text-slate-900 prose-p:my-4 prose-p:leading-relaxed prose-ul:my-4 prose-ol:my-4 prose-li:my-1.5 prose-h2:mt-6 prose-h2:mb-3 prose-h2:text-xl prose-h3:mt-4 prose-h3:mb-2 prose-h3:text-lg [&_strong]:font-semibold [&_strong]:text-slate-900 prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:bg-slate-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:my-4 prose-a:text-felt prose-a:no-underline hover:prose-a:underline prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto prose-img:rounded-lg prose-img:max-w-full"
              dangerouslySetInnerHTML={{ __html: post.body }}
            />
          </div>
        )}
        {/* Discussion */}
        <div className="mt-8 border-t border-slate-200 pt-8">
          <h2 className="text-xl font-semibold text-gray-900">Discussion</h2>
          <div className="mt-4">
            <CommentThread postId={post.id} postSlug={post.slug} />
          </div>
        </div>
      </article>
    </div>
  );
}
