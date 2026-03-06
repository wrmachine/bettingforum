"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface ThreadOption {
  slug: string;
  title: string;
  comments: number;
}

export default function SubmitCommentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetThread = searchParams.get("thread");
  const { data: session, status } = useSession();
  const [threads, setThreads] = useState<ThreadOption[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [threadSlug, setThreadSlug] = useState(presetThread || "");
  const [body, setBody] = useState("");

  useEffect(() => {
    fetch("/api/posts?type=thread&sort=new")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const items = data.map((p: { slug: string; title: string; comments: number }) => ({
            slug: p.slug,
            title: p.title,
            comments: p.comments ?? 0,
          }));
          setThreads(items);
          if (items.length > 0) {
            setThreadSlug((prev) => {
              if (prev && items.some((t: ThreadOption) => t.slug === prev)) return prev;
              return (presetThread && items.some((t: ThreadOption) => t.slug === presetThread))
                ? presetThread
                : items[0].slug;
            });
          }
        }
      })
      .catch(() => setThreads([]))
      .finally(() => setLoadingThreads(false));
  }, [presetThread]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!session?.user) {
      router.push("/auth/sign-in?callbackUrl=" + encodeURIComponent("/submit/comment"));
      return;
    }
    if (!threadSlug?.trim()) {
      setError("Please select a thread.");
      return;
    }
    if (!body?.trim()) {
      setError("Please enter your comment.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(threadSlug)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to post comment");
        return;
      }
      router.push(`/threads/${threadSlug}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loadingThreads) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="animate-pulse rounded-xl border border-slate-200 bg-slate-50 p-8">
          <div className="h-8 w-48 rounded bg-slate-200" />
          <div className="mt-6 h-10 w-full rounded bg-slate-200" />
          <div className="mt-4 h-36 w-full rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/submit/thread" className="text-sm text-slate-600 hover:text-slate-900">
        ← Back to submit
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">Reply to a Thread</h1>
      <p className="mt-2 text-slate-600">
        Post a comment to an existing thread. Select the thread, then write your reply.
      </p>

      {!session?.user && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          You need to{" "}
          <Link href="/auth/sign-in" className="font-medium underline hover:no-underline">
            sign in
          </Link>{" "}
          to post.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8">
        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
          <div>
            <label htmlFor="thread" className="block text-sm font-medium text-gray-700">
              Thread *
            </label>
            <select
              id="thread"
              value={threadSlug}
              onChange={(e) => setThreadSlug(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-accent focus:ring-accent"
              required
            >
              <option value="">Select a thread...</option>
              {threads.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.title} ({t.comments} comments)
                </option>
              ))}
            </select>
            {threads.length === 0 && !loadingThreads && (
              <p className="mt-1 text-sm text-slate-500">No threads yet.</p>
            )}
          </div>

          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700">
              Your comment *
            </label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-accent focus:ring-accent"
              placeholder="Share your thoughts..."
              required
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !session?.user || threads.length === 0}
            className="w-full rounded-md bg-accent px-4 py-2 font-medium text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Or{" "}
        <Link href="/submit/product" className="font-medium text-accent hover:underline">
          submit a product
        </Link>
        ,{" "}
        <Link href="/submit/article" className="font-medium text-accent hover:underline">
          write an article
        </Link>
        , or{" "}
        <Link href="/submit/bonus" className="font-medium text-accent hover:underline">
          share a bonus
        </Link>
        .
      </p>
    </div>
  );
}
