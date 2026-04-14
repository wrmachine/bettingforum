"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { SPORT_DIGEST_REGISTRY } from "@/lib/sports-digest/registry";

type Bot = {
  id: string;
  name: string;
  systemPrompt: string;
  threadTopics: string | null;
  allowedForums: string | null;
  maxResponsesPerHour: number;
  maxResponsesPerDay: number;
  enabled: boolean;
  defaultForumSlug: string | null;
  appendPartnerLinks: boolean;
  digestSportKey: string | null;
  user: { username: string; email: string };
};

export default function AdminAiBotsEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    systemPrompt: "",
    threadTopics: "",
    allowedForums: "",
    defaultForumSlug: "",
    appendPartnerLinks: true,
    digestSportKey: "",
    maxResponsesPerHour: 10,
    maxResponsesPerDay: 50,
    enabled: true,
  });

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/ai-bots/${id}`)
      .then((r) => r.json())
      .then((bot: Bot) => {
        let threadStr = "";
        let forumsStr = "";
        try {
          if (bot.threadTopics) {
            const arr = JSON.parse(bot.threadTopics);
            threadStr = Array.isArray(arr) ? arr.join(", ") : "";
          }
        } catch { /* ignore */ }
        try {
          if (bot.allowedForums) {
            const arr = JSON.parse(bot.allowedForums);
            forumsStr = Array.isArray(arr) ? arr.join(", ") : "";
          }
        } catch { /* ignore */ }
        setForm({
          name: bot.name,
          systemPrompt: bot.systemPrompt,
          threadTopics: threadStr,
          allowedForums: forumsStr,
          defaultForumSlug: bot.defaultForumSlug ?? "",
          appendPartnerLinks: bot.appendPartnerLinks ?? true,
          digestSportKey: bot.digestSportKey ?? "",
          maxResponsesPerHour: bot.maxResponsesPerHour,
          maxResponsesPerDay: bot.maxResponsesPerDay,
          enabled: bot.enabled,
        });
      })
      .catch(() => setError("Failed to load bot"))
      .finally(() => setFetching(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const threadTopics = form.threadTopics
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
      const allowedForums = form.allowedForums
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch(`/api/admin/ai-bots/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          systemPrompt: form.systemPrompt.trim(),
          threadTopics: threadTopics.length ? threadTopics : undefined,
          allowedForums: allowedForums.length ? allowedForums : undefined,
          defaultForumSlug: form.defaultForumSlug.trim() || null,
          appendPartnerLinks: form.appendPartnerLinks,
          digestSportKey: form.digestSportKey.trim() || null,
          maxResponsesPerHour: form.maxResponsesPerHour,
          maxResponsesPerDay: form.maxResponsesPerDay,
          enabled: form.enabled,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to update bot");
      }
      router.push("/admin/ai-bots");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <p className="text-slate-500">Loading...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Edit AI Bot</h1>
      <p className="mt-1 text-slate-600">Update bot configuration.</p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700">Admin Label *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">System Prompt *</label>
          <textarea
            required
            rows={6}
            value={form.systemPrompt}
            onChange={(e) => setForm((f) => ({ ...f, systemPrompt: e.target.value }))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Thread Topics</label>
          <textarea
            rows={2}
            value={form.threadTopics}
            onChange={(e) => setForm((f) => ({ ...f, threadTopics: e.target.value }))}
            placeholder="slot machine reviews, strategy debates"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Allowed Forums</label>
          <input
            type="text"
            value={form.allowedForums}
            onChange={(e) => setForm((f) => ({ ...f, allowedForums: e.target.value }))}
            placeholder="bet-general, bet-sportsbooks (empty = all)"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Digest-only sport (optional)
          </label>
          <select
            value={form.digestSportKey}
            onChange={(e) =>
              setForm((f) => ({ ...f, digestSportKey: e.target.value }))
            }
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          >
            <option value="">No — general forum bot (comments, replies, proactive)</option>
            {SPORT_DIGEST_REGISTRY.map((r) => (
              <option key={r.sportKey} value={r.sportKey}>
                Yes — only daily {r.displayName} digest posts (no general forum automation)
              </option>
            ))}
          </select>
          <p className="mt-0.5 text-xs text-slate-500">
            Use this for a dedicated “poster” account per sport. Digest cron picks the bot whose key
            matches the sport first; otherwise it uses a normal bot with Allowed forums.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Default forum for proactive threads
          </label>
          <input
            type="text"
            value={form.defaultForumSlug}
            onChange={(e) => setForm((f) => ({ ...f, defaultForumSlug: e.target.value }))}
            placeholder="bet-general or sport-mlb"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
          <p className="mt-0.5 text-xs text-slate-500">
            Used when the cron creates a proactive thread (empty = bet-general).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="appendPartnerLinks"
            checked={form.appendPartnerLinks}
            onChange={(e) =>
              setForm((f) => ({ ...f, appendPartnerLinks: e.target.checked }))
            }
            className="h-4 w-4 rounded border-slate-300"
          />
          <label htmlFor="appendPartnerLinks" className="text-sm text-slate-700">
            Append partner sportsbook link block to comments
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Max Responses / Hour</label>
            <input
              type="number"
              min={1}
              max={100}
              value={form.maxResponsesPerHour}
              onChange={(e) => setForm((f) => ({ ...f, maxResponsesPerHour: Number(e.target.value) || 10 }))}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Max Responses / Day</label>
            <input
              type="number"
              min={1}
              max={500}
              value={form.maxResponsesPerDay}
              onChange={(e) => setForm((f) => ({ ...f, maxResponsesPerDay: Number(e.target.value) || 50 }))}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="enabled"
            checked={form.enabled}
            onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
            className="h-4 w-4 rounded border-slate-300"
          />
          <label htmlFor="enabled" className="text-sm text-slate-700">
            Enabled (bot will respond and post when cron runs)
          </label>
        </div>

        {error && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <Link
            href="/admin/ai-bots"
            className="rounded border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
