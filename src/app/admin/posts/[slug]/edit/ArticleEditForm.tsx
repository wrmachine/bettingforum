"use client";

import { useState } from "react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { ImageUploadZone } from "@/components/ImageUploadZone";

interface ArticleEditFormProps {
  slug: string;
  initialData: {
    title: string;
    excerpt: string;
    body: string;
    featuredImageUrl: string;
    subheadline: string;
    lead: string;
  };
}

export function ArticleEditForm({ slug, initialData }: ArticleEditFormProps) {
  const [title, setTitle] = useState(initialData.title);
  const [excerpt, setExcerpt] = useState(initialData.excerpt);
  const [body, setBody] = useState(initialData.body);
  const [featuredImageUrl, setFeaturedImageUrl] = useState(initialData.featuredImageUrl);
  const [subheadline, setSubheadline] = useState(initialData.subheadline);
  const [lead, setLead] = useState(initialData.lead);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const handleFeaturedImageChange = (url: string) => {
    setFeaturedImageUrl(url);
    setMessage(url ? { type: "ok", text: "Featured image updated." } : null);
  };

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
          article: {
            featuredImageUrl: featuredImageUrl.trim() || null,
            subheadline: subheadline.trim() || null,
            lead: lead.trim() || null,
          },
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
            <label className="block text-sm font-medium text-slate-700">Subheadline</label>
            <input
              type="text"
              value={subheadline}
              onChange={(e) => setSubheadline(e.target.value)}
              className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
              placeholder="Newspaper-style subheadline"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Lead / Standfirst</label>
            <RichTextEditor
              value={lead}
              onChange={setLead}
              placeholder="Opening paragraph"
              minHeight="4rem"
              allowMedia={false}
              uploadEndpoint="/api/admin/upload"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Excerpt</label>
            <RichTextEditor
              value={excerpt}
              onChange={setExcerpt}
              placeholder="Brief summary (used in listings)"
              minHeight="4rem"
              allowMedia={false}
              uploadEndpoint="/api/admin/upload"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Featured Image</label>
            <div className="mt-1">
              <ImageUploadZone
                uploadEndpoint="/api/admin/upload"
                value={featuredImageUrl}
                onChange={handleFeaturedImageChange}
                label="Drop featured image or click to upload"
                allowUrlInput={true}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Body</label>
            <p className="mt-0.5 mb-1 text-xs text-slate-500">
              Use shortcodes: [product:slug] [casino:slug] [sportsbook:slug] [bonus:slug]
            </p>
            <RichTextEditor
              value={body}
              onChange={setBody}
              placeholder="Main article content..."
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

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-felt px-6 py-2 font-medium text-white hover:bg-felt/90 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
