"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface ListiclePost {
  title: string;
  excerpt: string | null;
  createdAt?: string | null;
  author: { username: string };
  listicle: {
    titleOverride: string | null;
    intro: string | null;
  };
}

export function ListicleDetailHeader() {
  const pathname = usePathname();
  const [post, setPost] = useState<ListiclePost | null>(null);

  const match = pathname?.match(/^\/listicles\/([^/]+)$/);
  const slug = match?.[1];

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      try {
        const base = typeof window !== "undefined" ? window.location.origin : "";
        const res = await fetch(`${base}/api/posts/${slug}`);
        if (!res.ok || cancelled) return;
        const text = await res.text();
        if (text.startsWith("<") || cancelled) return;
        const data = JSON.parse(text);
        if (data.type !== "listicle" || cancelled) return;
        setPost(data);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!slug || !post) return null;

  const title = post.listicle?.titleOverride ?? post.title;

  const formattedDate =
    post.createdAt &&
    new Date(post.createdAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold uppercase tracking-tight text-black sm:text-3xl">
        {title}
      </h1>
      {(post.author?.username || formattedDate) && (
        <p className="mt-2 text-sm text-slate-500">
          {post.author?.username && <span>by {post.author.username}</span>}
          {post.author?.username && formattedDate && <span className="mx-1">·</span>}
          {formattedDate && <span>{formattedDate}</span>}
        </p>
      )}
    </header>
  );
}
