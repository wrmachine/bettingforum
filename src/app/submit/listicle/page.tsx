"use client";

import { useState } from "react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SubmitListiclePage() {
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
        const data = await res.json();
        router.push(`/listicles/${data.slug}`);
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
      <h1 className="mt-4 text-3xl font-bold text-slate-900">Create a Listicle</h1>
      <p className="mt-2 text-slate-600">
        Create a curated list. You can add products after creating the list.
      </p>
      <form onSubmit={handleSubmit} className="mt-8">
        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              List Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="e.g. Best Crypto Sportsbooks 2025"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Introduction
            </label>
            <RichTextEditor
              value={form.intro}
              onChange={(html) => setForm((f) => ({ ...f, intro: html }))}
              placeholder="Introduce your list..."
              minHeight="8rem"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-accent px-4 py-2 font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Listicle"}
          </button>
        </div>
      </form>
    </div>
  );
}
