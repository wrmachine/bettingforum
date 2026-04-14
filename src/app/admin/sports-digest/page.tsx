"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type RegistryRow = { sportKey: string; forumSlug: string; displayName: string };

type DigestState = {
  enabled: Record<string, boolean>;
  lastDigestDate: Record<string, string>;
};

export default function AdminSportsDigestPage() {
  const [registry, setRegistry] = useState<RegistryRow[]>([]);
  const [state, setState] = useState<DigestState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [runResult, setRunResult] = useState<Record<string, unknown> | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    fetch("/api/admin/sports-digest-settings")
      .then((r) => r.json())
      .then((data) => {
        setRegistry(data.registry ?? []);
        setState(data.state ?? { enabled: {}, lastDigestDate: {} });
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!state) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/sports-digest-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setState(data.state);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const runJob = (force: boolean) => {
    setRunning(true);
    setRunResult(null);
    fetch("/api/admin/cron-run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job: "sports-digest", force }),
    })
      .then((r) => r.json())
      .then((data) => {
        setRunResult(data);
        load();
      })
      .catch((err) => setRunResult({ error: err.message }))
      .finally(() => setRunning(false));
  };

  const toggle = (sportKey: string, on: boolean) => {
    setState((s) =>
      s
        ? {
            ...s,
            enabled: { ...s.enabled, [sportKey]: on },
          }
        : s
    );
  };

  if (loading || !state) return <p className="text-slate-500">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Sports digest</h1>
      <p className="mt-1 max-w-2xl text-slate-600">
        Daily threads per sport (lines via web search for now; odds API can be added later). Requires
        an enabled AI bot whose <strong>Allowed forums</strong> includes the sport forum (e.g.{" "}
        <code className="text-sm">sport-mlb</code>) or leave empty for all forums.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={running}
          onClick={() => runJob(false)}
          className="rounded bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {running ? "Running…" : "Run digest now"}
        </button>
        <button
          type="button"
          disabled={running}
          onClick={() => runJob(true)}
          className="rounded border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-50"
        >
          Force (ignore “already today”)
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={save}
          className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save toggles"}
        </button>
      </div>

      {runResult && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-sm">
          <pre className="whitespace-pre-wrap">{JSON.stringify(runResult, null, 2)}</pre>
        </div>
      )}

      <div className="mt-8 max-w-2xl space-y-4">
        {registry.map((r) => (
          <div
            key={r.sportKey}
            className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 p-4"
          >
            <div>
              <p className="font-medium text-slate-900">{r.displayName}</p>
              <p className="text-sm text-slate-500">
                Forum: <code>{r.forumSlug}</code> · Last digest (UTC):{" "}
                {state.lastDigestDate[r.sportKey] ?? "—"}
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={state.enabled[r.sportKey] !== false}
                onChange={(e) => toggle(r.sportKey, e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Enabled
            </label>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <p className="mt-8 text-sm text-slate-500">
        <Link href="/admin/partner-sportsbooks" className="text-emerald-600 hover:underline">
          Partner sportsbooks
        </Link>
        {" · "}
        <Link href="/admin/ai-bots" className="text-emerald-600 hover:underline">
          AI Bots
        </Link>
      </p>
    </div>
  );
}
