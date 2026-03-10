"use client";

import { useState } from "react";
import { RichTextEditor } from "@/components/RichTextEditor";

interface PostEditFormProps {
  slug: string;
  status: string;
  type: string;
  initialData: { title: string; excerpt: string; body: string };
}

function viewUrl(type: string, slug: string): string {
  switch (type) {
    case "article": return `/articles/${slug}`;
    case "product": return `/products/${slug}`;
    case "bonus": return `/bonuses/${slug}`;
    case "listicle": return `/listicles/${slug}`;
    default: return `/threads/${slug}`;
  }
}

export function PostEditForm({ slug, status, type, initialData }: PostEditFormProps) {
  const [title, setTitle] = useState(initialData.title);
  const [excerpt, setExcerpt] = useState(initialData.excerpt);
  const [body, setBody] = useState(initialData.body);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/posts/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          excerpt: excerpt.trim() || null,
          postBody: body.trim() || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Save failed");
      }
      setMessage({ type: "ok", text: "Saved successfully." });
    } catch (e) {
      setMessage({ type: "err", text: e instanceof Error ? e.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (publish: boolean) => {
    setPublishing(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/posts/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: publish ? "published" : "draft" }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed");
      }
      setCurrentStatus(publish ? "published" : "draft");
      const url = viewUrl(type, slug);
      setMessage({ type: "ok", text: publish ? `Published. Visible at ${url}` : "Unpublished (draft)." });
    } catch (e) {
      setMessage({ type: "err", text: e instanceof Error ? e.message : "Failed" });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Content</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Excerpt</label>
            <RichTextEditor
              value={excerpt}
              onChange={setExcerpt}
              placeholder="Brief summary"
              minHeight="4rem"
              allowMedia={false}
              uploadEndpoint="/api/admin/upload"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Body</label>
            <RichTextEditor
              value={body}
              onChange={setBody}
              placeholder="Main content"
              minHeight="16rem"
              className="mt-1"
              uploadEndpoint="/api/admin/upload"
            />
          </div>
        </div>
      </section>

      {message && (
        <div
          className={`rounded-lg p-4 ${
            message.type === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-felt px-6 py-2 font-medium text-white hover:bg-felt/90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
        {currentStatus === "draft" ? (
          <button
            type="button"
            onClick={() => handlePublish(true)}
            disabled={publishing}
            className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {publishing ? "Publishing…" : "Publish"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handlePublish(false)}
            disabled={publishing}
            className="rounded-lg border border-slate-300 bg-white px-6 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {publishing ? "…" : "Unpublish (Draft)"}
          </button>
        )}
      </div>
    </form>
  );
}
