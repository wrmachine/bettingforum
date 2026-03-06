"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { AdminEditButton } from "./AdminEditButton";
import { CommentThread } from "./CommentThread";
import { ArticleProductEmbed, ArticleBonusEmbed } from "./ArticleShortcodeEmbed";
import { formatRelativeTime, stripHtml } from "@/lib/format";
import { parseShortcodes } from "@/lib/shortcodes";
import type { ShortcodeData } from "@/lib/shortcode-resolve";

function ArticleBody({
  body,
  shortcodeData,
}: {
  body: string;
  shortcodeData?: ShortcodeData | null;
}) {
  const segments = parseShortcodes(body);
  const hasShortcodes = segments.some((s) => s.type === "shortcode");

  if (!hasShortcodes || !shortcodeData) {
    return (
      <div className="mt-8">
        <div
          className="article-body text-lg leading-relaxed text-slate-700 sm:text-xl [&_p]:mb-4 [&_p]:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="article-body space-y-4 text-lg leading-relaxed text-slate-700 sm:text-xl [&_p]:mb-4 [&_p]:leading-relaxed">
        {segments.map((seg, i) =>
          seg.type === "text" ? (
            seg.content ? (
              <div key={i} dangerouslySetInnerHTML={{ __html: seg.content }} />
            ) : null
          ) : seg.shortcode ? (
            <ShortcodeEmbed
              key={i}
              shortcode={seg.shortcode}
              shortcodeData={shortcodeData}
            />
          ) : null
        )}
      </div>
    </div>
  );
}

function ShortcodeEmbed({
  shortcode,
  shortcodeData,
}: {
  shortcode: { type: string; slug: string };
  shortcodeData: ShortcodeData;
}) {
  if (shortcode.type === "bonus") {
    const bonus = shortcodeData.bonuses.get(shortcode.slug);
    if (!bonus) return <span className="text-slate-500">[bonus:{shortcode.slug}]</span>;
    return <ArticleBonusEmbed bonus={bonus} />;
  }
  const product = shortcodeData.products.get(shortcode.slug);
  if (!product) return <span className="text-slate-500">[{shortcode.type}:{shortcode.slug}]</span>;
  return <ArticleProductEmbed product={product} />;
}

function getReadTimeMinutes(body: string | null, stored?: number | null): number {
  if (typeof stored === "number" && stored > 0) return stored;
  if (!body || !body.trim()) return 1;
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200)); // ~200 wpm
}

interface ArticleDetailProps {
  shortcodeData?: ShortcodeData | null;
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
    tags: { name: string; slug?: string }[];
    article?: {
      featuredImageUrl: string | null;
      subheadline: string | null;
      lead: string | null;
      factChecker?: string | null;
      readTimeMinutes?: number | null;
    } | null;
  };
}

export function ArticleDetail({ post, shortcodeData }: ArticleDetailProps) {
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

  const lead = post.article?.lead ?? post.excerpt;
  const subheadline = post.article?.subheadline;
  const featuredImage = post.article?.featuredImageUrl;
  const factChecker = post.article?.factChecker;
  const readTime = getReadTimeMinutes(post.body, post.article?.readTimeMinutes);
  const formattedDate =
    post.createdAt &&
    new Date(post.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Articles
        </Link>
        <AdminEditButton type="article" slug={post.slug} />
      </div>

      <article className="border border-slate-200 bg-white shadow-sm">
        {/* Featured image - always at top */}
        <div className="aspect-[21/9] w-full overflow-hidden bg-slate-100">
          {featuredImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={featuredImage}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300"
              aria-hidden
            >
              <svg
                className="h-16 w-16 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="px-6 py-8 sm:px-12 sm:py-12">
          {/* Categories (tags) */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <Link
                  key={t.name}
                  href={`/articles?tag=${encodeURIComponent(t.slug ?? t.name)}`}
                  className="rounded bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
                >
                  {t.name}
                </Link>
              ))}
            </div>
          )}

          {/* Section label */}
          <span className="mt-4 block text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Article
          </span>

          {/* Headline - newspaper serif style */}
          <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>

          {/* Subheadline */}
          {subheadline && (
            <p className="mt-3 text-xl font-medium text-slate-600">
              {subheadline}
            </p>
          )}

          {/* Meta: Author, Fact checker, Date, Read time */}
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-slate-200 pb-6 text-sm">
            <span className="text-slate-500">By</span>
            <Link
              href={`/u/${post.author.username}`}
              className="font-semibold text-slate-900 hover:text-accent"
            >
              {post.author.username}
            </Link>
            {factChecker && (
              <>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500">
                  Fact checked by <span className="font-medium text-slate-700">{factChecker}</span>
                </span>
              </>
            )}
            {formattedDate && (
              <>
                <span className="text-slate-400">·</span>
                <time className="text-slate-500">{formattedDate}</time>
              </>
            )}
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">{readTime} min read</span>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleVote("up")}
                disabled={status !== "authenticated" || voting}
                className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Upvote"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4l8 8h-5v8h-6v-8H4l8-8z" />
                </svg>
              </button>
              <span className="text-sm font-semibold text-slate-700">{votes}</span>
              <button
                type="button"
                onClick={() => handleVote("down")}
                disabled={status !== "authenticated" || voting}
                className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Downvote"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 20l-8-8h5V4h6v8h5l-8 8z" />
                </svg>
              </button>
              <span className="text-sm text-slate-500">
                {post.comments} {post.comments === 1 ? "comment" : "comments"}
              </span>
            </div>
          </div>

          {/* Lead / standfirst - drop cap style */}
          {lead && (() => {
            const plain = stripHtml(lead).trim();
            if (!plain) return null;
            return (
              <p className="mt-8 text-lg leading-relaxed text-slate-700 sm:text-xl">
                <span className="float-left mr-2 font-serif text-5xl font-bold leading-none text-slate-400">
                  {plain.charAt(0)}
                </span>
                {plain.slice(1)}
              </p>
            );
          })()}

          {/* Body - single column */}
          {post.body && (
            <ArticleBody body={post.body} shortcodeData={shortcodeData} />
          )}
        </div>

        {/* Comments */}
        <div className="border-t border-slate-200 bg-slate-50/50 px-6 py-5 sm:px-12 sm:py-6">
          <CommentThread postId={post.id} postSlug={post.slug} compact />
        </div>
      </article>
    </div>
  );
}
