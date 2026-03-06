"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ForumThreadCard } from "@/components/ForumThreadCard";

interface ThreadData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  author: string;
  votes: number;
  comments: number;
  tags?: string[];
  createdAt: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(q);
  const [threads, setThreads] = useState<ThreadData[]>([]);
  const [loading, setLoading] = useState(!!q);
  const [searched, setSearched] = useState(!!q);

  useEffect(() => {
    setQuery(q);
  }, [q]);

  useEffect(() => {
    if (!q || q.length < 2) {
      setThreads([]);
      setLoading(false);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    fetch(`/api/posts?q=${encodeURIComponent(q)}&type=thread&sort=new`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: ThreadData[]) => {
        setThreads(Array.isArray(data) ? data : []);
      })
      .catch(() => setThreads([]))
      .finally(() => setLoading(false));
  }, [q]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length >= 2) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-900">Search all threads</h1>
      <p className="mt-2 text-slate-600">
        Find discussions by keywords in titles, summaries, and content.
      </p>

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="flex gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search threads..."
            className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
            aria-label="Search"
          />
          <button
            type="submit"
            className="rounded-lg bg-felt px-6 py-2.5 font-medium text-white hover:bg-felt/90"
          >
            Search
          </button>
        </div>
      </form>

      {q.length > 0 && q.length < 2 && (
        <p className="mt-4 text-sm text-slate-500">Enter at least 2 characters to search.</p>
      )}

      <div className="mt-8">
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-slate-500">
            Searching...
          </div>
        ) : !searched ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
            <p className="text-slate-600">Enter a search term to find threads.</p>
          </div>
        ) : threads.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-600">No threads match your search.</p>
            <Link href="/submit/thread" className="mt-4 inline-block text-felt hover:underline">
              Start a new thread
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white">
            <p className="border-b border-slate-100 px-4 py-3 text-sm text-slate-500">
              {threads.length} result{threads.length !== 1 ? "s" : ""} for &quot;{q}&quot;
            </p>
            <div className="divide-y divide-slate-100">
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
          </div>
        )}
      </div>
    </div>
  );
}
