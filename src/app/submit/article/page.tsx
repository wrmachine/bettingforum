"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RichTextEditor } from "@/components/RichTextEditor";

export default function SubmitArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    subheadline: "",
    lead: "",
    body: "",
    featuredImageUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "article",
          title: form.title,
          excerpt: form.lead || form.excerpt || undefined,
          body: form.body,
          article: {
            featuredImageUrl: form.featuredImageUrl || undefined,
            subheadline: form.subheadline || undefined,
            lead: form.lead || form.excerpt || undefined,
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/articles/${data.slug}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/submit" className="text-sm text-slate-600 hover:text-slate-900">
        ← Back to submit
      </Link>
      <h1 className="mt-4 font-serif text-3xl font-bold text-slate-900">
        Write an Article
      </h1>
      <p className="mt-2 text-slate-600">
        Share in-depth analysis and guides with a professional layout.
      </p>
      <form onSubmit={handleSubmit} className="mt-8">
        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Headline *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-serif text-lg"
              placeholder="e.g. Understanding Value Betting: A Complete Guide"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subheadline
            </label>
            <input
              type="text"
              value={form.subheadline}
              onChange={(e) =>
                setForm((f) => ({ ...f, subheadline: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Newspaper-style subheadline (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Lead / Standfirst
            </label>
            <RichTextEditor
              value={form.lead}
              onChange={(html) => setForm((f) => ({ ...f, lead: html }))}
              placeholder="Opening paragraph that draws readers in..."
              minHeight="4rem"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Featured Image URL
            </label>
            <input
              type="url"
              value={form.featuredImageUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, featuredImageUrl: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Article Body *
            </label>
            <p className="mt-0.5 mb-1 text-xs text-slate-500">
              Shortcodes: [product:slug] [casino:slug] [sportsbook:slug] [bonus:slug]
            </p>
            <RichTextEditor
              value={form.body}
              onChange={(html) => setForm((f) => ({ ...f, body: html }))}
              placeholder="Your full article content..."
              minHeight="16rem"
              className="mt-1"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish Article"}
          </button>
        </div>
      </form>
    </div>
  );
}
