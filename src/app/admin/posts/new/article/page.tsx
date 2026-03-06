"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RichTextEditor } from "@/components/RichTextEditor";

export default function AdminNewArticlePage() {
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
        router.push("/admin/posts?type=article");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link href="/admin/posts" className="text-sm text-slate-600 hover:text-slate-900">
        ← Back to Posts
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Add Article</h1>
      <p className="mt-1 text-slate-600">Create a new article as admin.</p>
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Headline *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="e.g. Understanding Value Betting"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Lead / Standfirst</label>
            <RichTextEditor
              value={form.lead}
              onChange={(html) => setForm((f) => ({ ...f, lead: html }))}
              placeholder="Opening paragraph..."
              minHeight="4rem"
              uploadEndpoint="/api/admin/upload"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Article Body *</label>
            <RichTextEditor
              value={form.body}
              onChange={(html) => setForm((f) => ({ ...f, body: html }))}
              placeholder="Full article content..."
              minHeight="16rem"
              className="mt-1"
              uploadEndpoint="/api/admin/upload"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Featured Image URL</label>
            <input
              type="url"
              value={form.featuredImageUrl}
              onChange={(e) => setForm((f) => ({ ...f, featuredImageUrl: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="https://..."
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-felt px-6 py-2 font-medium text-white hover:bg-felt/90 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Article"}
          </button>
        </div>
      </form>
    </div>
  );
}
