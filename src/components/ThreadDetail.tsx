"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { AdminEditButton } from "./AdminEditButton";
import { getForumBySlug } from "@/lib/forums";
import { CommentThread } from "./CommentThread";
import { formatRelativeTime } from "@/lib/format";

interface ThreadDetailProps {
  post: {
    id: string;
    slug: string;
    title: string;
    body: string | null;
    excerpt: string | null;
    createdAt?: string;
    author: { username: string };
    votes: number;
    comments: number;
    tags: { name: string }[];
  };
}

export function ThreadDetail({ post }: ThreadDetailProps) {
  const searchParams = useSearchParams();
  const fromForum = searchParams.get("from");
  const backHref = fromForum && fromForum.startsWith("/f/") ? fromForum : "/threads";
  const forumSlug = fromForum?.replace(/^\/f\//, "");
  const forum = forumSlug ? getForumBySlug(forumSlug) : null;
  const { status } = useSession();
  const [votes, setVotes] = useState(post.votes);
  const [voting, setVoting] = useState(false);

  const handleVote = async (direction: "up" | "down") => {
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

  const featuredTag = post.tags?.find((t) =>
    ["featured", "pinned", "hot"].includes(t.name.toLowerCase())
  );

  return (
    <div className="space-y-0">
      {/* Forum header bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href={backHref}
            className="mt-1 rounded p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label={fromForum ? "Back to forum" : "Back to discussions"}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 text-slate-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </span>
              <h2 className="text-lg font-semibold text-slate-900">
                {forum ? forum.name : "Discussions"}
              </h2>
            </div>
            <p className="mt-0.5 text-sm text-slate-500">
              {forum ? forum.description : "Discuss betting strategies and community topics"}
            </p>
          </div>
        </div>
        <Link
          href={forum ? `/submit/thread?forum=${forum.slug}` : "/submit/thread"}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Start new thread
        </Link>
      </div>

      {/* Main post card */}
      <article className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="p-6 sm:p-8">
          {/* Author row: avatar, name, tag, time, menu */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-1 items-center gap-3">
              <Link
                href={`/u/${post.author.username}`}
                className="flex shrink-0 items-center gap-3"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
                  {post.author.username.charAt(0).toUpperCase()}
                </span>
                <div>
                  <span className="font-medium text-slate-900">{post.author.username}</span>
                  <span className="ml-2 text-sm text-slate-500">
                    {post.createdAt && formatRelativeTime(post.createdAt)}
                  </span>
                </div>
              </Link>
              {featuredTag && (
                <span className="rounded bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                  {featuredTag.name}
                </span>
              )}
            </div>
            <AdminEditButton type="thread" slug={post.slug} />
          </div>

          {/* Title */}
          <div className="mt-6">
            <h1 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
              {post.title}
            </h1>
          </div>

          {/* Post body — HTML from rich editor or plain text */}
          {post.body && (
            <div className="mt-6 border-t border-slate-100 pt-6">
              <div className="prose prose-slate max-w-none text-slate-700 prose-p:my-3 prose-ul:my-3 prose-li:my-0.5 prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-img:max-w-full prose-img:h-auto [&_[data-youtube-video]]:my-4 [&_[data-youtube-video]_iframe]:aspect-video [&_[data-youtube-video]_iframe]:w-full [&_[data-youtube-video]_iframe]:max-w-2xl">
                {/<[a-z][\s\S]*>/i.test(post.body) ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: post.body }}
                    className="text-[18px] leading-relaxed [&_iframe]:max-w-full"
                  />
                ) : (
                  <div className="whitespace-pre-wrap font-sans text-[18px] leading-relaxed text-slate-700">
                    {post.body}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Engagement: comments + votes */}
          <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {post.comments} {post.comments === 1 ? "comment" : "comments"}
            </span>
            <span className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => handleVote("up")}
                disabled={status !== "authenticated" || voting}
                className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Upvote"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4l8 8h-5v8h-6v-8H4l8-8z" />
                </svg>
              </button>
              <span className="min-w-[1.5rem] text-center font-medium text-slate-700">{votes}</span>
              <button
                type="button"
                onClick={() => handleVote("down")}
                disabled={status !== "authenticated" || voting}
                className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Downvote"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 20l-8-8h5V4h6v8h5l-8 8z" />
                </svg>
              </button>
            </span>
            {post.tags && post.tags.length > 0 && !featuredTag && (
              <div className="flex gap-1.5">
                {post.tags.map((t) => (
                  <span
                    key={t.name}
                    className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comment section - integrated, single Add comment input at bottom */}
        <div className="border-t border-slate-200 bg-slate-50/50 px-6 py-4 sm:px-8 sm:py-5">
          <CommentThread postId={post.id} postSlug={post.slug} compact />
        </div>
      </article>
    </div>
  );
}
