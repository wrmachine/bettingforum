"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArticleCard } from "./ArticleCard";
import { PostCard } from "./PostCard";
import { ProductCard } from "./ProductCard";
import { BonusCard } from "./BonusCard";
import type { ForumConfig } from "@/lib/forums";

type SortOption = "best" | "new" | "trending";

type PostItem = {
  id: string;
  type: string;
  title: string;
  slug: string;
  excerpt: string | null;
  author: string;
  votes: number;
  comments: number;
  tags?: string[];
  createdAt: string;
  featuredImageUrl?: string | null;
  productType?: string;
  bonusSummary?: string | null;
  siteUrl?: string | null;
  logoUrl?: string | null;
  rating?: number | null;
  reviewCount?: number;
  featured?: boolean;
  offerValue?: string | null;
  promoCode?: string | null;
  product?: { brandName: string; slug: string; siteUrl?: string | null; logoUrl?: string | null } | null;
};

export function ForumContent({ forum }: { forum: ForumConfig }) {
  const [items, setItems] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>("new");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ sort: sort === "best" ? "top" : sort });
    if (forum.productType) {
      params.set("type", forum.productType);
    } else if (forum.type) {
      params.set("type", forum.type);
    }
    if (forum.tag) params.set("tag", forum.tag);
    if (forum.userOnly) params.set("authorRole", "user");
    // All topic/sports forums with threads: filter by forum so threads belong to this board
    if (forum.type === "thread") params.set("forum", forum.slug);

    fetch(`/api/posts?${params}`)
      .then(async (r) => {
        if (!r.ok) return [];
        const text = await r.text();
        return text ? JSON.parse(text) : [];
      })
      .then((data: PostItem[]) => {
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [forum.slug, forum.type, forum.tag, forum.productType, forum.userOnly, sort]);

  return (
    <div className="mt-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
          {(["new", "trending", "best"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSort(s)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                sort === s
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {s === "best" ? "Best" : s === "new" ? "New" : "Trending"}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          {forum.type?.includes("thread") && (
            <Link
              href={`/submit/thread?forum=${forum.slug}${forum.tag ? `&tag=${forum.tag}` : ""}`}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Start new thread
            </Link>
          )}
          {forum.type?.includes("article") && !forum.productType && (
            <Link
              href="/submit/article"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Write Article
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-slate-500">
            Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-16 text-center">
            <p className="text-lg font-medium text-slate-600">No posts yet</p>
            <p className="mt-2 text-sm text-slate-500">
              Be the first to share in this forum.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              {forum.type?.includes("thread") && (
                <Link
                  href={`/submit/thread?forum=${forum.slug}${forum.tag ? `&tag=${forum.tag}` : ""}`}
                  className="inline-flex rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Start a thread
                </Link>
              )}
              {forum.type?.includes("article") && (
                <Link
                  href="/submit/article"
                  className="inline-flex rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Write an article
                </Link>
              )}
              {forum.type === "product" && (
                <Link
                  href="/submit/product"
                  className="inline-flex rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Submit a product
                </Link>
              )}
              {forum.type === "bonus" && (
                <Link
                  href="/submit/bonus"
                  className="inline-flex rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Submit a bonus
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              if (item.type === "article") {
                return (
                  <ArticleCard
                    key={item.id}
                    article={{
                      id: item.id,
                      title: item.title,
                      slug: item.slug,
                      excerpt: item.excerpt,
                      author: item.author,
                      votes: item.votes,
                      comments: item.comments,
                      tags: item.tags,
                      createdAt: item.createdAt,
                      featuredImageUrl: item.featuredImageUrl,
                    }}
                  />
                );
              }
              if (item.type === "thread") {
                return (
                  <PostCard
                    key={item.id}
                    post={{
                      id: item.id,
                      title: item.title,
                      slug: item.slug,
                      excerpt: item.excerpt ?? "",
                      type: "thread",
                      votes: item.votes,
                      comments: item.comments,
                      tags: item.tags,
                    }}
                    fromForum={`/f/${forum.slug}`}
                  />
                );
              }
              // Bonus codes use BonusCard (not ProductCard)
              if (item.type === "bonus") {
                return (
                  <BonusCard
                    key={item.id}
                    bonus={{
                      id: item.id,
                      title: item.title,
                      slug: item.slug,
                      excerpt: item.excerpt ?? "",
                      offerValue: item.offerValue,
                      promoCode: item.promoCode,
                      votes: item.votes,
                      comments: item.comments,
                      featured: item.featured,
                      product: item.product ?? undefined,
                    }}
                  />
                );
              }
              if (item.type === "product") {
                return (
                  <ProductCard
                    key={item.id}
                    product={{
                      id: item.id,
                      title: item.title,
                      slug: item.slug,
                      excerpt: item.excerpt ?? "",
                      votes: item.votes,
                      comments: item.comments,
                      tags: item.tags ?? [],
                      productType: item.productType,
                      bonusSummary: item.bonusSummary,
                      siteUrl: item.siteUrl,
                      logoUrl: item.logoUrl,
                      rating: item.rating,
                      reviewCount: item.reviewCount ?? 0,
                    }}
                  />
                );
              }
              // Fallback for listicle and other types
              return (
                <ArticleCard
                  key={item.id}
                  article={{
                    id: item.id,
                    title: item.title,
                    slug: item.slug,
                    excerpt: item.excerpt,
                    author: item.author,
                    votes: item.votes,
                    comments: item.comments,
                    tags: item.tags,
                    createdAt: item.createdAt,
                    featuredImageUrl: item.featuredImageUrl,
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
