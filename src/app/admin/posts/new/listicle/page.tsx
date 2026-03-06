"use client";

import { useState } from "react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminNewListiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    intro: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/listicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          intro: form.intro,
          items: [],
        }),
      });
      if (res.ok) {
        router.push("/admin/posts?type=listicle");
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
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Add Listicle</h1>
      <p className="mt-1 text-slate-600">Create a new list. Add products after creating.</p>
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">List Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="e.g. Best Crypto Sportsbooks 2025"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Introduction</label>
            <RichTextEditor
              value={form.intro}
              onChange={(html) => setForm((f) => ({ ...f, intro: html }))}
              placeholder="Introduce your list..."
              minHeight="8rem"
              uploadEndpoint="/api/admin/upload"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-felt px-6 py-2 font-medium text-white hover:bg-felt/90 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Listicle"}
          </button>
        </div>
      </form>
    </div>
  );
}
