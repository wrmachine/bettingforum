"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { formatRelativeTime, stripHtml } from "@/lib/format";

export interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    author: string;
    votes: number;
    comments: number;
    tags?: string[];
    createdAt: string;
    featuredImageUrl?: string | null;
  };
}

export function ArticleCard({ article }: ArticleCardProps) {
  const { status } = useSession();
  const [votes, setVotes] = useState(article.votes);
  const [voting, setVoting] = useState(false);

  const handleVote = async (e: React.MouseEvent, direction: "up" | "down") => {
    e.preventDefault();
    e.stopPropagation();
    if (status !== "authenticated" || voting) return;
    setVoting(true);
    try {
      const res = await fetch(`/api/posts/${article.slug}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.votes === "number") setVotes(data.votes);
      }
    } finally {
      setVoting(false);
    }
  };

  return (
    <article className="flex overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm">
      {/* Up/Down vote column - on the left (matches ForumThreadCard, PostCard) */}
      <div className="flex w-10 shrink-0 flex-col items-center justify-center gap-0.5 border-r border-slate-100 bg-slate-50/50 py-2">
        <button
          type="button"
          onClick={(e) => handleVote(e, "up")}
          disabled={status !== "authenticated" || voting}
          className="text-slate-400 transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Upvote"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 4l8 8h-5v8h-6v-8H4l8-8z" />
          </svg>
        </button>
        <span className="text-xs font-semibold text-slate-700">{votes}</span>
        <button
          type="button"
          onClick={(e) => handleVote(e, "down")}
          disabled={status !== "authenticated" || voting}
          className="text-slate-400 transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Downvote"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 20l-8-8h5V4h6v8h5l-8 8z" />
          </svg>
        </button>
      </div>

      {/* Big rectangle image + content */}
      <Link href={`/articles/${article.slug}`} className="min-w-0 flex-1">
        <div className="flex flex-col md:flex-row">
          {/* Featured image: full-width banner on mobile, square on desktop */}
          <div className="aspect-video w-full shrink-0 overflow-hidden rounded-t-lg bg-slate-100 md:h-[10rem] md:w-[10rem] md:rounded-t-none md:rounded-l-sm md:aspect-auto">
            {article.featuredImageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={article.featuredImageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-slate-300">
                {article.title.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center p-4">
            <span className="text-xs font-medium text-slate-500">Article</span>
            <h3 className="mt-0.5 font-semibold text-slate-900 hover:text-accent hover:underline">
              {article.title}
            </h3>
            {article.excerpt && (
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                {stripHtml(article.excerpt)}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>
                <span className="font-medium text-slate-600">{article.author}</span>
                <span className="mx-1">·</span>
                <span>{formatRelativeTime(article.createdAt)}</span>
              </span>
              {article.tags && article.tags.length > 0 && (
                <span className="flex gap-1">
                  {article.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </span>
              )}
              <span>{article.comments} comments</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
