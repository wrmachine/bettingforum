"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

type PostType = "product" | "listicle" | "thread" | "article" | "bonus";

interface AdminEditButtonProps {
  type: PostType;
  slug: string;
  label?: string;
  className?: string;
}

const editHref: Record<PostType, (slug: string) => string> = {
  product: (s) => `/admin/products/${s}/edit`,
  listicle: (s) => `/admin/listicles/${s}/edit`,
  thread: (s) => `/admin/posts/${s}/edit`,
  article: (s) => `/admin/posts/${s}/edit`,
  bonus: (s) => `/admin/posts/${s}/edit`,
};

const defaultLabels: Record<PostType, string> = {
  product: "Edit product",
  listicle: "Edit listicle",
  thread: "Edit thread",
  article: "Edit article",
  bonus: "Edit bonus",
};

export function AdminEditButton({ type, slug, label, className = "" }: AdminEditButtonProps) {
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === "admin";

  if (!isAdmin) return null;

  const href = editHref[type](slug);
  const text = label ?? defaultLabels[type];

  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 ${className}`}
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      {text}
    </Link>
  );
}
