"use client";

import { useEffect, useState } from "react";

interface ForumConfig {
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  type?: string;
  productType?: string;
  productSlug?: string;
  tag?: string;
  userOnly?: boolean;
}

interface ProductOption {
  slug: string;
  brandName: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  topic: "Topic Forums",
  content: "Articles",
  sports: "Sports",
  product: "Product Forums",
  bonus: "Bonus",
};

const ICON_OPTIONS = [
  "globe", "chart", "question", "hand", "gift", "sportsbook", "casino",
  "crypto", "tool", "bonus", "article", "nfl", "nba", "mlb", "nhl",
  "soccer", "mma", "tennis", "golf", "boxing", "esports",
];

const CATEGORY_OPTIONS = [
  { value: "topic", label: "Topic" },
  { value: "content", label: "Content / Articles" },
  { value: "sports", label: "Sports" },
  { value: "product", label: "Product" },
  { value: "bonus", label: "Bonus" },
];

const TYPE_OPTIONS = [
  { value: "thread", label: "Thread" },
  { value: "product", label: "Product" },
  { value: "article", label: "Article" },
  { value: "article,listicle", label: "Article + Listicle" },
  { value: "bonus", label: "Bonus" },
];

const HARDCODED_SLUGS = new Set([
  "bet-general", "bet-strategy", "bet-ama", "bet-introduce-yourself", "bet-promotions",
  "bet-sportsbooks", "bet-casinos", "bet-crypto", "bet-tools",
  "bet-bonuses", "bet-bonuses-first-time", "bet-bonuses-reload", "bet-bonuses-no-deposit",
  "bet-articles",
  "sport-nfl", "sport-nba", "sport-mlb", "sport-nhl", "sport-soccer",
  "sport-mma", "sport-tennis", "sport-golf", "sport-boxing", "sport-esports",
]);

const DEFAULT_NEW_FORUM = {
  slug: "",
  name: "",
  description: "",
  icon: "globe",
  category: "topic",
  type: "thread",
  productType: "",
  productSlug: "",
  tag: "",
};

export default function AdminForumsPage() {
  const [forums, setForums] = useState<ForumConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, { name: string; description: string }>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [newForum, setNewForum] = useState({ ...DEFAULT_NEW_FORUM });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductOption[]>([]);

  const load = () =>
    fetch("/api/admin/forums")
      .then((r) => r.json())
      .then((data) => {
        setForums(data);
        setEdits({});
      });

  useEffect(() => {
    load().finally(() => setLoading(false));
    fetch("/api/admin/forums/products")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setProducts(data); })
      .catch(() => {});
  }, []);

  const handleSave = async (slug: string, override?: { name?: string; description?: string }) => {
    setSaving(slug);
    try {
      const payload = override ?? edits[slug];
      const res = await fetch("/api/admin/forums", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          name: payload?.name ?? "",
          description: payload?.description ?? "",
        }),
      });
      const data = await res.json();
      setForums(data);
      setEdits((prev) => {
        const next = { ...prev };
        delete next[slug];
        return next;
      });
    } finally {
      setSaving(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);
    try {
      const res = await fetch("/api/admin/forums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: newForum.slug,
          name: newForum.name,
          description: newForum.description,
          icon: newForum.icon,
          category: newForum.category,
          type: newForum.type,
          productType: newForum.productType || undefined,
          productSlug: newForum.productSlug || undefined,
          tag: newForum.tag || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Failed to create forum");
        return;
      }
      setForums(data);
      setNewForum({ ...DEFAULT_NEW_FORUM });
      setShowCreate(false);
    } catch {
      setCreateError("Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm(`Delete custom forum "${slug}"? Posts assigned to this forum will become unassigned.`)) return;
    setDeleting(slug);
    try {
      const res = await fetch(`/api/admin/forums?slug=${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) setForums(data);
    } finally {
      setDeleting(null);
    }
  };

  const getEdit = (forum: ForumConfig) => edits[forum.slug] ?? { name: forum.name, description: forum.description };
  const setEdit = (slug: string, field: "name" | "description", value: string) => {
    setEdits((prev) => ({
      ...prev,
      [slug]: {
        ...getEdit(forums.find((f) => f.slug === slug)!),
        [field]: value,
      },
    }));
  };

  const isCustom = (slug: string) => !HARDCODED_SLUGS.has(slug);

  const grouped = forums.reduce(
    (acc, f) => {
      if (!acc[f.category]) acc[f.category] = [];
      acc[f.category].push(f);
      return acc;
    },
    {} as Record<string, ForumConfig[]>
  );

  if (loading) return <div className="text-slate-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Forum Settings</h1>
          <p className="mt-1 text-slate-600">
            Edit forum titles and descriptions, or create new custom forums.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          {showCreate ? "Cancel" : "+ New Forum"}
        </button>
      </div>

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Create New Forum</h2>

          {createError && (
            <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{createError}</div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Slug *</label>
              <input
                type="text"
                required
                value={newForum.slug}
                onChange={(e) =>
                  setNewForum((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))
                }
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm"
                placeholder="e.g. bet-picks"
              />
              <p className="mt-1 text-xs text-slate-500">URL path: /f/{newForum.slug || "..."}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Name *</label>
              <input
                type="text"
                required
                value={newForum.name}
                onChange={(e) => setNewForum((f) => ({ ...f, name: e.target.value }))}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                placeholder="e.g. bet/picks"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <input
                type="text"
                value={newForum.description}
                onChange={(e) => setNewForum((f) => ({ ...f, description: e.target.value }))}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                placeholder="Short description for this forum"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Icon</label>
              <select
                value={newForum.icon}
                onChange={(e) => setNewForum((f) => ({ ...f, icon: e.target.value }))}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              >
                {ICON_OPTIONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Category</label>
              <select
                value={newForum.category}
                onChange={(e) => {
                  const cat = e.target.value;
                  if (cat === "bonus") {
                    setNewForum((f) => ({ ...f, category: cat, type: "bonus", icon: "bonus" }));
                  } else {
                    setNewForum((f) => ({ ...f, category: cat }));
                  }
                }}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Post Type</label>
              <select
                value={newForum.type}
                onChange={(e) => setNewForum((f) => ({ ...f, type: e.target.value }))}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {newForum.category === "bonus" && (
              <div>
                <label className="block text-sm font-medium text-slate-700">Product (optional)</label>
                <select
                  value={newForum.productSlug}
                  onChange={(e) => setNewForum((f) => ({ ...f, productSlug: e.target.value }))}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                >
                  <option value="">All products</option>
                  {products.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.brandName}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  Scope this bonus forum to a specific product&apos;s bonuses
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700">Tag (optional)</label>
              <input
                type="text"
                value={newForum.tag}
                onChange={(e) => setNewForum((f) => ({ ...f, tag: e.target.value }))}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                placeholder={newForum.category === "bonus" ? "e.g. free-spins, cashback" : "e.g. picks"}
              />
              <p className="mt-1 text-xs text-slate-500">
                {newForum.category === "bonus"
                  ? "Filter bonuses by this tag (e.g. free-spins, cashback, second-deposit)"
                  : "Filter posts by this tag slug"}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Forum"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 space-y-10">
        {(["topic", "content", "sports", "product", "bonus"] as const).map(
          (cat) =>
            grouped[cat]?.length > 0 && (
              <section key={cat}>
                <h2 className="mb-4 text-lg font-semibold text-slate-800">{CATEGORY_LABELS[cat]}</h2>
                <div className="space-y-4">
                  {grouped[cat].map((forum) => {
                    const edit = getEdit(forum);
                    const hasChanges =
                      edit.name !== forum.name || edit.description !== forum.description;
                    const custom = isCustom(forum.slug);

                    return (
                      <div
                        key={forum.slug}
                        className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-500">{forum.slug}</span>
                          {custom && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              Custom
                            </span>
                          )}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-slate-700">Name</label>
                            <input
                              type="text"
                              value={edit.name}
                              onChange={(e) => setEdit(forum.slug, "name", e.target.value)}
                              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                              placeholder="e.g. bet/general"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700">Description</label>
                            <input
                              type="text"
                              value={edit.description}
                              onChange={(e) => setEdit(forum.slug, "description", e.target.value)}
                              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                              placeholder="Short description for this forum"
                            />
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          {hasChanges && (
                            <button
                              type="button"
                              onClick={() => handleSave(forum.slug)}
                              disabled={saving === forum.slug}
                              className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              {saving === forum.slug ? "Saving..." : "Save"}
                            </button>
                          )}
                          {!custom && (
                            <button
                              type="button"
                              onClick={() => handleSave(forum.slug, { name: "", description: "" })}
                              disabled={saving === forum.slug}
                              className="text-sm text-slate-500 hover:text-slate-700 disabled:opacity-50"
                              title="Reset to default (from code)"
                            >
                              Reset to default
                            </button>
                          )}
                          {custom && (
                            <button
                              type="button"
                              onClick={() => handleDelete(forum.slug)}
                              disabled={deleting === forum.slug}
                              className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
                            >
                              {deleting === forum.slug ? "Deleting..." : "Delete"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )
        )}
      </div>
    </div>
  );
}
