"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Bot = {
  id: string;
  name: string;
  systemPrompt: string;
  threadTopics: string | null;
  enabled: boolean;
  user: { id: string; username: string; email: string };
};

export default function AdminAiBotsPage() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [runResult, setRunResult] = useState<Record<string, unknown> | null>(null);
  const [running, setRunning] = useState(false);

  const runNow = () => {
    setRunning(true);
    setRunResult(null);
    fetch("/api/admin/cron-run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job: "ai-bots", force: true }),
    })
      .then((r) => r.json())
      .then((data) => setRunResult(data))
      .catch((err) => setRunResult({ error: err.message }))
      .finally(() => setRunning(false));
  };

  useEffect(() => {
    fetch("/api/admin/ai-bots")
      .then((r) => r.json())
      .then(setBots)
      .catch(() => setBots([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">AI Bots</h1>
        <Link
          href="/admin/ai-bots/new"
          className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Create Bot
        </Link>
      </div>
      <p className="mt-1 text-slate-600">
        Autonomous AI bots that respond to posts and create threads. Configure personas and thread topics.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          onClick={runNow}
          disabled={running}
          className="rounded bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {running ? "Running…" : "Run bot now"}
        </button>
        <Link
          href="/admin/ai-bots/activity"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          View Activity Log →
        </Link>
      </div>

      {runResult && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-sm">
          <pre className="whitespace-pre-wrap">{JSON.stringify(runResult, null, 2)}</pre>
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-slate-500">Loading...</p>
      ) : bots.length === 0 ? (
        <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-slate-600">No bots yet.</p>
          <Link
            href="/admin/ai-bots/new"
            className="mt-4 inline-block text-emerald-600 hover:underline"
          >
            Create your first bot
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {bots.map((bot) => (
            <div
              key={bot.id}
              className={`rounded-lg border p-4 ${
                bot.enabled ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-75"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    {bot.name}
                    <span className="ml-2 text-sm font-normal text-slate-500">
                      @{bot.user.username}
                    </span>
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                    {bot.systemPrompt.slice(0, 150)}...
                  </p>
                  {!bot.enabled && (
                    <span className="mt-2 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                      Disabled
                    </span>
                  )}
                </div>
                <Link
                  href={`/admin/ai-bots/${bot.id}/edit`}
                  className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
