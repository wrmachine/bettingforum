"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RichTextEditor } from "@/components/RichTextEditor";

interface StaticPage {
  id: string;
  slug: string;
  title: string;
  body: string;
}

export default function AdminPagesPage() {
  const [items, setItems] = useState<StaticPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<StaticPage>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () =>
    fetch("/api/admin/pages")
      .then((r) => r.json())
      .then(setItems);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editing) {
        const res = await fetch(`/api/admin/pages/${editing}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to update");
          return;
        }
        setEditing(null);
      } else {
        const res = await fetch("/api/admin/pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to create");
          return;
        }
        setShowAdd(false);
      }
      setForm({});
      load();
    } catch {
      setError("Request failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this page?")) return;
    await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return <div className="text-slate-500">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Static Pages</h1>
      <p className="mt-1 text-slate-600">
        Edit privacy, terms, about, and other static pages. Use Markdown for the body.
      </p>

      <button
        onClick={() => {
          setShowAdd(true);
          setForm({ slug: "", title: "", body: "" });
          setError(null);
        }}
        className="mt-6 rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        Add Page
      </button>

      {showAdd && (
        <form onSubmit={handleSave} className="mt-6 max-w-2xl space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-6">
          <h3 className="font-semibold">New Page</h3>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-slate-700">Slug (URL path)</label>
            <input
              required
              value={form.slug ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="privacy"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono"
            />
            <p className="mt-1 text-xs text-slate-500">Page will be available at /{form.slug || "slug"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Title</label>
            <input
              required
              value={form.title ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Privacy Policy"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Body</label>
            <RichTextEditor
              value={form.body ?? ""}
              onChange={(html) => setForm((f) => ({ ...f, body: html }))}
              placeholder="Page content..."
              minHeight="16rem"
              uploadEndpoint="/api/admin/upload"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAdd(false);
                setForm({});
                setError(null);
              }}
              className="rounded border px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            {editing === item.id ? (
              <form onSubmit={handleSave} className="space-y-4">
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div>
                  <label className="block text-sm font-medium text-slate-700">Slug</label>
                  <input
                    required
                    value={form.slug ?? item.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    className="mt-1 w-full rounded border px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Title</label>
                  <input
                    required
                    value={form.title ?? item.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="mt-1 w-full rounded border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Body</label>
                  <RichTextEditor
                    value={form.body ?? item.body ?? ""}
                    onChange={(html) => setForm((f) => ({ ...f, body: html }))}
                    placeholder="Page content..."
                    minHeight="16rem"
                    uploadEndpoint="/api/admin/upload"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(null);
                      setForm({});
                      setError(null);
                    }}
                    className="rounded border px-4 py-2"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <code className="font-mono text-sm text-emerald-700">/{item.slug}</code>
                    <span className="font-medium">{item.title}</span>
                    <Link
                      href={`/${item.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-slate-500 hover:text-slate-700"
                    >
                      View
                    </Link>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditing(item.id);
                        setForm(item);
                        setError(null);
                      }}
                      className="text-sm text-emerald-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {item.body && (
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                    {item.body.slice(0, 120)}...
                  </p>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
