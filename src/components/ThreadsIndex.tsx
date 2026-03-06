"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ForumThreadCard } from "./ForumThreadCard";

type SortOption = "best" | "new" | "trending";

interface ThreadData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  author: string;
  votes: number;
  comments: number;
  tags: string[];
  createdAt: string;
}

export function ThreadsIndex() {
  const [threads, setThreads] = useState<ThreadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>("new");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/posts?type=thread&sort=${sort}`)
      .then(async (r) => {
        if (!r.ok) return [];
        const text = await r.text();
        return text ? JSON.parse(text) : [];
      })
      .then((data: ThreadData[]) => {
        setThreads(Array.isArray(data) ? data : []);
      })
      .catch(() => setThreads([]))
      .finally(() => setLoading(false));
  }, [sort]);

  return (
    <div className="mt-6">
      {/* Header row: tabs + Start new thread - Product Hunt style */}
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
        <Link
          href="/submit/thread"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Start new thread
        </Link>
      </div>

      {/* Thread list - same card design as front page */}
      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading threads...</div>
      ) : threads.length === 0 ? (
        <div className="py-12 text-center text-slate-500">
          No threads yet.{" "}
          <Link href="/submit/thread" className="text-accent hover:underline">
            Start the first one
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {threads.map((thread) => (
            <ForumThreadCard
              key={thread.id}
              thread={{
                ...thread,
                tags: thread.tags ?? [],
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
