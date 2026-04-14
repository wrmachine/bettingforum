"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PartnerLink = { label: string; url: string };

type CatalogItem = { label: string; url: string; productSlug: string };

export default function AdminPartnerSportsbooksPage() {
  const [links, setLinks] = useState<PartnerLink[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/partner-sportsbooks")
      .then((r) => r.json())
      .then((data) => {
        setLinks(Array.isArray(data.links) ? data.links : []);
        setCatalog(Array.isArray(data.catalog) ? data.catalog : []);
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const addRow = () => setLinks((L) => [...L, { label: "", url: "" }]);

  const addFromCatalog = (c: CatalogItem) => {
    setLinks((L) => [...L, { label: c.label, url: c.url }]);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/partner-sportsbooks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ links }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setLinks(data.links ?? links);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-slate-500">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Partner sportsbooks</h1>
      <p className="mt-1 max-w-2xl text-slate-600">
        Ordered list of display names and outbound URLs (e.g. affiliate links). AI digest posts and
        bot comments append this block automatically when enabled on each bot.
      </p>

      <div className="mt-8 max-w-2xl space-y-4">
        {links.map((row, i) => (
          <div key={i} className="flex flex-wrap gap-2">
            <input
              type="text"
              value={row.label}
              onChange={(e) => {
                const next = [...links];
                next[i] = { ...next[i], label: e.target.value };
                setLinks(next);
              }}
              placeholder="Label (e.g. DraftKings)"
              className="min-w-[140px] flex-1 rounded border border-slate-300 px-3 py-2"
            />
            <input
              type="url"
              value={row.url}
              onChange={(e) => {
                const next = [...links];
                next[i] = { ...next[i], url: e.target.value };
                setLinks(next);
              }}
              placeholder="https://..."
              className="min-w-[200px] flex-[2] rounded border border-slate-300 px-3 py-2"
            />
            <button
              type="button"
              onClick={() => setLinks((L) => L.filter((_, j) => j !== i))}
              className="rounded border border-slate-300 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
            >
              Remove
            </button>
          </div>
        ))}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={addRow}
            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Add row
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>

        {catalog.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-slate-800">Add from catalog (sportsbooks)</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {catalog.map((c) => (
                <li key={c.productSlug}>
                  <button
                    type="button"
                    onClick={() => addFromCatalog(c)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 hover:bg-slate-100"
                  >
                    + {c.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {saved && (
          <p className="text-sm text-emerald-700">Saved.</p>
        )}
      </div>

      <p className="mt-8 text-sm text-slate-500">
        <Link href="/admin/ai-bots" className="text-emerald-600 hover:underline">
          ← AI Bots
        </Link>
      </p>
    </div>
  );
}
