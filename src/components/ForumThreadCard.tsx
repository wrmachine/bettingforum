"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { formatRelativeTime } from "@/lib/format";

export interface ForumThreadCardProps {
  thread: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    author: string;
    votes: number;
    comments: number;
    tags?: string[];
    createdAt: string;
  };
}

export function ForumThreadCard({ thread }: ForumThreadCardProps) {
  const router = useRouter();
  const { status } = useSession();
  const [votes, setVotes] = useState(thread.votes);
  const [voting, setVoting] = useState(false);

  const handleVote = async (e: React.MouseEvent, direction: "up" | "down") => {
    e.preventDefault();
    e.stopPropagation();
    if (status !== "authenticated" || voting) return;
    setVoting(true);
    try {
      const res = await fetch(`/api/posts/${thread.slug}/vote`, {
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
    <article className="flex rounded-none border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm">
      {/* Up/Down vote column - on the left (matches PostCard) */}
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

      <Link href={`/threads/${thread.slug}`} className="min-w-0 flex-1 p-4">
        <div className="min-w-0 flex-1">
          <span className="text-xs font-medium text-slate-500">Discussion</span>
          <h3 className="mt-0.5 font-semibold text-slate-900 hover:text-accent hover:underline">
            {thread.title}
          </h3>
          <p className="mt-1 line-clamp-4 text-sm text-slate-600">
            {thread.excerpt || ""}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            {thread.tags && thread.tags.length > 0 && (
              <span className="flex gap-1">
                {thread.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-none bg-slate-100 px-1.5 py-0.5 text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </span>
            )}
            <span>
              by{" "}
              <span
                role="link"
                tabIndex={0}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push(`/u/${thread.author}`);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    router.push(`/u/${thread.author}`);
                  }
                }}
                className="cursor-pointer font-medium text-slate-600 hover:text-accent hover:underline"
              >
                {thread.author}
              </span>{" "}
              · {formatRelativeTime(thread.createdAt)}
            </span>
            <span>{thread.comments} comments</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
