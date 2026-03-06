"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArticleCard } from "./ArticleCard";
import Link from "next/link";

type SortOption = "best" | "new" | "trending";

interface ArticleItem {
  id: string;
  type: "article";
  title: string;
  slug: string;
  excerpt: string | null;
  author: string;
  votes: number;
  comments: number;
  tags?: string[];
  createdAt: string;
  featuredImageUrl?: string | null;
}

export function ArticlesIndex() {
  const searchParams = useSearchParams();
  const sortParam = (searchParams.get("sort") as SortOption) || "new";
  const tagParam = searchParams.get("tag") ?? "";
  const validSort: SortOption[] = ["new", "trending", "best"];
  const initialSort = validSort.includes(sortParam) ? sortParam : "new";

  const [items, setItems] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>(initialSort);

  useEffect(() => {
    setSort(initialSort);
  }, [initialSort]);

  useEffect(() => {
    setLoading(true);
    const tagQ = tagParam ? `&tag=${encodeURIComponent(tagParam)}` : "";
    fetch(`/api/posts?type=article&sort=${sort}${tagQ}`)
      .then(async (r) => {
        if (!r.ok) return [];
        const text = await r.text();
        return text ? JSON.parse(text) : [];
      })
      .then((data: ArticleItem[]) => {
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [sort, tagParam]);

  return (
    <div className="mt-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
          {(["new", "trending", "best"] as const).map((s) => {
            const tagQ = tagParam ? `&tag=${encodeURIComponent(tagParam)}` : "";
            const href = s === "new"
              ? tagParam ? `/articles?tag=${encodeURIComponent(tagParam)}` : "/articles"
              : `/articles?sort=${s}${tagQ}`;
            return (
            <Link
              key={s}
              href={href}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                sort === s
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {s === "best" ? "Best" : s === "new" ? "New" : "Trending"}
            </Link>
          );
          })}
        </div>
        <div className="flex gap-3">
          <Link
            href="/submit/article"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Write Article
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-slate-500">
            Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-16 text-center">
            <p className="text-lg font-medium text-slate-600">No articles yet</p>
            <p className="mt-2 text-sm text-slate-500">
              Write an article to share analysis, guides, and insights with the community.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/submit/article"
                className="inline-flex rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Write Article
              </Link>
            </div>
          </div>
        ) : (
          items.map((item) => <ArticleCard key={item.id} article={item} />)
        )}
      </div>
    </div>
  );
}
