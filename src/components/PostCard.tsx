"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";

export interface PostCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    type: "product" | "listicle" | "thread" | "article";
    votes: number;
    comments: number;
    tags?: string[];
    logoUrl?: string | null;
  };
  /** When set, thread links include ?from= for back navigation (e.g. /f/bet-general) */
  fromForum?: string;
}

const typeLabels: Record<string, string> = {
  product: "Product",
  listicle: "Best Of",
  thread: "Discussion",
  article: "Article",
};

export function PostCard({ post, fromForum }: PostCardProps) {
  const { status } = useSession();
  const [votes, setVotes] = useState(post.votes);
  const [voting, setVoting] = useState(false);

  const baseHref =
    post.type === "product"
      ? `/products/${post.slug}`
      : post.type === "listicle"
        ? `/listicles/${post.slug}`
        : post.type === "article"
          ? `/articles/${post.slug}`
          : `/threads/${post.slug}`;
  const href =
    post.type === "thread" && fromForum
      ? `${baseHref}?from=${encodeURIComponent(fromForum)}`
      : baseHref;

  const handleVote = async (e: React.MouseEvent, direction: "up" | "down") => {
    e.preventDefault();
    e.stopPropagation();
    if (status !== "authenticated" || voting) return;
    setVoting(true);
    try {
      const res = await fetch(`/api/posts/${post.slug}/vote`, {
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
    <article className="flex rounded-lg border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm">
      {/* Up/Down vote column */}
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

      {/* Square graphic */}
      <div className="flex shrink-0 items-center justify-center self-stretch p-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-slate-100 text-sm font-bold text-slate-500">
          {post.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.logoUrl}
              alt=""
              className="h-10 w-10 rounded-sm object-cover"
            />
          ) : (
            post.title.charAt(0)
          )}
        </div>
      </div>

      <Link href={href} className="min-w-0 flex-1 p-4">
        <div className="min-w-0 flex-1">
          <span className="text-xs font-medium text-slate-500">
            {typeLabels[post.type] ?? post.type}
          </span>
          <h3 className="mt-0.5 font-semibold text-slate-900 hover:text-accent hover:underline">
            {post.title}
          </h3>
          <p className="mt-1 line-clamp-4 text-sm text-slate-600">
            {post.excerpt}
          </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              {post.tags && post.tags.length > 0 && (
                <span className="flex gap-1">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </span>
              )}
              <span>{post.comments} comments</span>
            </div>
        </div>
      </Link>
    </article>
  );
}
