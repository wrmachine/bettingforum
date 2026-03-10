"use client";

import { useEffect, useState } from "react";

interface Redirect {
  id: string;
  source: string;
  destination: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminRedirectsPage() {
  const [items, setItems] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Redirect>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [bulkInput, setBulkInput] = useState("");
  const [bulkResult, setBulkResult] = useState<{ created?: number; errors?: { index: number; from: string; to: string; error: string }[] } | null>(null);

  const load = () =>
    fetch("/api/admin/redirects")
      .then((r) => r.json())
      .then(setItems);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.source || !form.destination) return;
    if (editing) {
      await fetch(`/api/admin/redirects/${editing}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setEditing(null);
    } else {
      await fetch("/api/admin/redirects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, enabled: form.enabled !== false }),
      });
      setShowAdd(false);
    }
    setForm({});
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this redirect?")) return;
    await fetch(`/api/admin/redirects/${id}`, { method: "DELETE" });
    load();
  };

  const handleBulkImport = async () => {
    setBulkResult(null);
    const lines = bulkInput
      .trim()
      .split(/\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const redirects: { from: string; to: string }[] = [];
    for (const line of lines) {
      // Support: /old\t/new or /old,/new or /old | /new or JSON
      const sep = line.includes("\t")
        ? "\t"
        : line.includes("|")
          ? "|"
          : line.includes(",")
            ? ","
            : " ";

      const parts = line.split(sep).map((p) => p.trim());
      if (parts.length >= 2) {
        const from = parts[0].startsWith("/") ? parts[0] : `/${parts[0]}`;
        const to = parts[1].startsWith("/") ? parts[1] : `/${parts[1]}`;
        redirects.push({ from, to });
      }
    }

    if (redirects.length === 0) {
      setBulkResult({ errors: [] });
      return;
    }

    const res = await fetch("/api/admin/redirects/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ redirects }),
    });
    const data = await res.json();
    setBulkResult(data);
    setBulkInput("");
    load();
    if (data.created) setShowBulk(false);
  };

  const toggleEnabled = async (r: Redirect) => {
    await fetch(`/api/admin/redirects/${r.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !r.enabled }),
    });
    load();
  };

  if (loading) return <div className="text-slate-500">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">301 Redirects</h1>
      <p className="mt-2 text-slate-600">
        Manage old-site → new-site redirects. All redirects return 301 (permanent). Changes take effect immediately.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => {
            setShowAdd(true);
            setForm({ source: "/", destination: "/", enabled: true });
          }}
          className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Add Redirect
        </button>
        <button
          onClick={() => setShowBulk(!showBulk)}
          className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Bulk Import
        </button>
      </div>

      {showBulk && (
        <div className="mt-6 max-w-2xl rounded-lg border border-slate-200 bg-slate-50 p-6">
          <h3 className="font-semibold text-slate-900">Bulk Import</h3>
          <p className="mt-1 text-sm text-slate-600">
            One redirect per line. Use Tab, comma, or pipe: <code className="rounded bg-slate-200 px-1">/old	/new</code> or{" "}
            <code className="rounded bg-slate-200 px-1">/old, /new</code>
          </p>
          <textarea
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            placeholder={"/forum	/f/bet-general\n/old-page	/new-page"}
            rows={8}
            className="mt-3 w-full font-mono text-sm"
          />
          {bulkResult && (
            <p className="mt-2 text-sm">
              {bulkResult.created != null && <span className="text-emerald-600">Created: {bulkResult.created}</span>}
              {bulkResult.errors?.length ? (
                <span className="ml-2 text-amber-600">Errors: {bulkResult.errors.length}</span>
              ) : null}
            </p>
          )}
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleBulkImport}
              className="rounded bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700"
            >
              Import
            </button>
            <button type="button" onClick={() => setShowBulk(false)} className="rounded border px-4 py-2 text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {showAdd && (
        <form onSubmit={handleSave} className="mt-6 max-w-2xl space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-6">
          <h3 className="font-semibold">New Redirect</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700">Source (old path)</label>
            <input
              required
              value={form.source ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
              placeholder="/forum"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Destination (new path)</label>
            <input
              required
              value={form.destination ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
              placeholder="/f/bet-general"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono"
            />
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

      <div className="mt-8 space-y-3">
        {items.length === 0 ? (
          <p className="text-slate-500">No redirects yet. Add one or bulk import.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={`rounded-lg border bg-white p-4 shadow-sm ${!item.enabled ? "border-slate-200 opacity-60" : "border-slate-200"}`}
            >
              {editing === item.id ? (
                <form onSubmit={handleSave} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500">Source</label>
                    <input
                      required
                      value={form.source ?? item.source}
                      onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
                      className="mt-1 w-full rounded border px-3 py-2 font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500">Destination</label>
                    <input
                      required
                      value={form.destination ?? item.destination}
                      onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
                      className="mt-1 w-full rounded border px-3 py-2 font-mono text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="rounded bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700">
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(null);
                        setForm({});
                      }}
                      className="rounded border px-3 py-1.5 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <code className="text-sm text-slate-700">{item.source}</code>
                    <span className="mx-2 text-slate-400">→</span>
                    <code className="text-sm text-emerald-700">{item.destination}</code>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <label className="flex cursor-pointer items-center gap-1.5 text-sm">
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={() => toggleEnabled(item)}
                        className="rounded"
                      />
                      Active
                    </label>
                    <button
                      onClick={() => {
                        setEditing(item.id);
                        setForm(item);
                      }}
                      className="text-sm text-emerald-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-sm text-red-600 hover:underline">
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
