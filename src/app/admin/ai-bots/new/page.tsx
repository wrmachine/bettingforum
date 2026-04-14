"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SPORT_DIGEST_REGISTRY } from "@/lib/sports-digest/registry";

const ADJECTIVES = [
  "Lucky", "Wild", "Big", "Sharp", "Royal", "Golden", "Hot", "Ace", "Bold",
  "Slick", "Fast", "High", "Crazy", "Cool", "Epic", "Mega", "Pro", "Top",
  "True", "Live", "Daily", "Night", "Cash", "Rich", "Max", "Neon", "Dark",
  "Chill", "Hyped", "Savage",
];

const NOUNS = [
  "Bettor", "Punter", "Whale", "Shark", "Roller", "Runner", "Grinder",
  "Staker", "Degen", "Hustler", "Winner", "Player", "Chaser", "Tipper",
  "Picker", "Spotter", "Sniper", "Edge", "Odds", "Parlay", "Gambler",
  "Spinner", "Dealer", "Flop", "Jackpot", "Bluffer", "Raiser", "Stack",
  "Streak", "Maverick",
];

function generateUsername(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}${noun}${num}`;
}

export default function AdminAiBotsNewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    name: "",
    systemPrompt: "",
    threadTopics: "",
    allowedForums: "",
    defaultForumSlug: "",
    appendPartnerLinks: true,
    digestSportKey: "",
    maxResponsesPerHour: 10,
    maxResponsesPerDay: 50,
  });

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

      const email = form.email.trim().toLowerCase();
      if (!email.includes("@")) {
        setError("Invalid email");
        return;
      }
      const defaultEmail = email || `${form.username.toLowerCase().replace(/\s+/g, "")}@bot.local`;

      const res = await fetch("/api/admin/ai-bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim(),
          email: defaultEmail,
          name: form.name.trim(),
          systemPrompt: form.systemPrompt.trim(),
          threadTopics: threadTopics.length ? threadTopics : undefined,
          allowedForums: allowedForums.length ? allowedForums : undefined,
          defaultForumSlug: form.defaultForumSlug.trim() || null,
          appendPartnerLinks: form.appendPartnerLinks,
          digestSportKey: form.digestSportKey.trim() || null,
          maxResponsesPerHour: form.maxResponsesPerHour,
          maxResponsesPerDay: form.maxResponsesPerDay,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to create bot");
      }
      router.push("/admin/ai-bots");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Create AI Bot</h1>
      <p className="mt-1 text-slate-600">
        Create a new bot user. The bot will run autonomously via cron.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700">Username *</label>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              required
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              placeholder="SlotLover"
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <button
              type="button"
              onClick={() => {
                const name = generateUsername();
                setForm((f) => ({
                  ...f,
                  username: name,
                  email: `${name.toLowerCase()}@bot.local`,
                }));
              }}
              className="shrink-0 rounded border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              title="Generate random username"
            >
              🎲 Random
            </button>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">Display name on the forum</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Email *</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="slotlover@bot.local"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
          <p className="mt-0.5 text-xs text-slate-500">Use @bot.local for system bots</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Admin Label *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Slot Enthusiast"
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
            placeholder="You love playing slots and find reviewing slot games fun. You're enthusiastic, share personal experiences, and recommend games you've enjoyed."
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
          <p className="mt-0.5 text-xs text-slate-500">Personality and behavior instructions for Claude</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Thread Topics</label>
          <textarea
            rows={2}
            value={form.threadTopics}
            onChange={(e) => setForm((f) => ({ ...f, threadTopics: e.target.value }))}
            placeholder="slot machine reviews, new game announcements"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
          <p className="mt-0.5 text-xs text-slate-500">Comma-separated. What threads this bot creates.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Allowed Forums</label>
          <input
            type="text"
            value={form.allowedForums}
            onChange={(e) => setForm((f) => ({ ...f, allowedForums: e.target.value }))}
            placeholder="bet-general, bet-sportsbooks (leave empty for all)"
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
            <option value="">No — general forum bot</option>
            {SPORT_DIGEST_REGISTRY.map((r) => (
              <option key={r.sportKey} value={r.sportKey}>
                Only daily {r.displayName} digest posts
              </option>
            ))}
          </select>
          <p className="mt-0.5 text-xs text-slate-500">
            Digest-only bots do not run general comments, replies, or proactive threads.
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
            Used when the cron creates a random proactive thread (empty = bet-general).
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
            Append partner sportsbook link block to comments (configure under Partner sportsbooks)
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
            {loading ? "Creating..." : "Create Bot"}
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
