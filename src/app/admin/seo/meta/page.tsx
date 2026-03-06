"use client";

import { useEffect, useState } from "react";

interface PageMeta {
  id: string;
  pathPattern: string;
  title: string | null;
  description: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterCard: string | null;
  noIndex: boolean;
  noFollow: boolean;
  canonical: string | null;
}

export default function AdminSeoMetaPage() {
  const [items, setItems] = useState<PageMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<PageMeta>>({});
  const [showAdd, setShowAdd] = useState(false);

  const load = () =>
    fetch("/api/admin/seo/page-meta")
      .then((r) => r.json())
      .then(setItems);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await fetch(`/api/admin/seo/page-meta/${editing}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setEditing(null);
    } else {
      await fetch("/api/admin/seo/page-meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setShowAdd(false);
    }
    setForm({});
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this page meta?")) return;
    await fetch(`/api/admin/seo/page-meta/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return <div className="text-slate-500">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Page Meta Overrides</h1>
      <p className="mt-1 text-slate-600">
        Override title, description, and meta per path. Use / for home, /products/* for all product pages.
      </p>

      <button
        onClick={() => {
          setShowAdd(true);
          setForm({ pathPattern: "/" });
        }}
        className="mt-6 rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        Add Page Meta
      </button>

      {showAdd && (
        <form onSubmit={handleSave} className="mt-6 max-w-2xl space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-6">
          <h3 className="font-semibold">New Page Meta</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700">Path Pattern</label>
            <input
              required
              value={form.pathPattern ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, pathPattern: e.target.value }))}
              placeholder="/ or /products or /products/*"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Title</label>
              <input
                value={form.title ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <input
                value={form.description ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.noIndex ?? false}
                onChange={(e) => setForm((f) => ({ ...f, noIndex: e.target.checked }))}
              />
              No Index
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.noFollow ?? false}
                onChange={(e) => setForm((f) => ({ ...f, noFollow: e.target.checked }))}
              />
              No Follow
            </label>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
              Save
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="rounded border px-4 py-2">
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
                <input
                  required
                  value={form.pathPattern ?? item.pathPattern}
                  onChange={(e) => setForm((f) => ({ ...f, pathPattern: e.target.value }))}
                  className="w-full rounded border px-3 py-2 font-mono"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    value={form.title ?? item.title ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Title"
                    className="rounded border px-3 py-2"
                  />
                  <input
                    value={form.description ?? item.description ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Description"
                    className="rounded border px-3 py-2"
                  />
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.noIndex ?? item.noIndex}
                      onChange={(e) => setForm((f) => ({ ...f, noIndex: e.target.checked }))}
                    />
                    No Index
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.noFollow ?? item.noFollow}
                      onChange={(e) => setForm((f) => ({ ...f, noFollow: e.target.checked }))}
                    />
                    No Follow
                  </label>
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
                  <code className="font-mono text-sm text-emerald-700">{item.pathPattern}</code>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditing(item.id);
                        setForm(item);
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
                {(item.title || item.description) && (
                  <p className="mt-2 text-sm text-slate-600">
                    {item.title && <span className="font-medium">{item.title}</span>}
                    {item.description && ` — ${item.description.slice(0, 80)}...`}
                  </p>
                )}
                {(item.noIndex || item.noFollow) && (
                  <p className="mt-1 text-xs text-amber-600">
                    {item.noIndex && "noindex "}
                    {item.noFollow && "nofollow"}
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
