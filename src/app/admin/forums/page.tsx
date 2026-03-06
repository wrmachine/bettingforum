"use client";

import { useEffect, useState } from "react";

interface ForumConfig {
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  topic: "Topic Forums",
  content: "Articles",
  sports: "Sports",
  product: "Product Forums",
  bonus: "Bonus",
};

export default function AdminForumsPage() {
  const [forums, setForums] = useState<ForumConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, { name: string; description: string }>>({});

  const load = () =>
    fetch("/api/admin/forums")
      .then((r) => r.json())
      .then((data) => {
        setForums(data);
        setEdits({});
      });

  useEffect(() => {
    load().finally(() => setLoading(false));
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
      <h1 className="text-2xl font-bold text-slate-900">Forum Settings</h1>
      <p className="mt-1 text-slate-600">
        Edit forum titles and descriptions. Changes apply site-wide (sidebar, forum pages, metadata).
      </p>

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

                    return (
                      <div
                        key={forum.slug}
                        className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="mb-2 font-mono text-xs text-slate-500">{forum.slug}</div>
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
                          <button
                            type="button"
                            onClick={() => handleSave(forum.slug, { name: "", description: "" })}
                            disabled={saving === forum.slug}
                            className="text-sm text-slate-500 hover:text-slate-700 disabled:opacity-50"
                            title="Reset to default (from code)"
                          >
                            Reset to default
                          </button>
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
