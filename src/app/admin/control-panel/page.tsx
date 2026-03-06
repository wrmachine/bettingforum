"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const DEFAULT_AI_PROMPT = `You are an expert betting and gambling product reviewer. Generate complete, professional content for product pages.

Generate ALL of the following. Fill in missing data with reasonable, professional text based on the product type—never invent specific claims (bonus amounts, odds) unless provided. Use "" for fields you cannot reasonably infer.

Output a valid JSON object ONLY, no other text. Keys:
- html: Full review article (400-800 words), valid HTML: <p>, <h2>, <h3>, <ul>, <li>, <strong>, <a>. Sections: Overview, Bonuses, Betting/Payment options, Licensing, Geo restrictions.
- excerpt: 1-2 sentences for product page summary (plain text)
- bonusSummary: Brief bonus info, e.g. "100% up to $500" or "Welcome offer available" (plain text)
- minDeposit: e.g. "$10" or "Varies" (plain text)
- shortDescription: 1-2 punchy sentences for listicle cards—highlights key selling point (plain text)
- licenseJurisdiction: e.g. "Malta MGA" or "Curacao" (plain text)
- geoRestrictions: e.g. "US, UK restricted" or "Most jurisdictions" (plain text)`;

const DEFAULT_LISTICLE_INTRO = `You are an expert betting and gambling content writer. Write a compelling introduction for a listicle.

Output valid HTML only: <p> tags for paragraphs. 2-4 paragraphs. Engaging, sets context for the list. No headers.
Match the tone to the listicle title. Be informative and helpful, not promotional.`;

const DEFAULT_LISTICLE_PICKS = `You are an expert on betting products (sportsbooks, casinos, crypto sites). Select the best products for a listicle.

You will receive:
1. The listicle title
2. A list of available products with id, brandName, productType, bonusSummary, shortDescription
3. Optional filter: only consider products of a specific type (casino, sportsbook, crypto, tool, tipster)
4. maxPicks: how many to select

Return a JSON object with one key: "productIds" — an array of product IDs in rank order (best first).
Only include IDs from the provided products. Respect the productType filter if given.
Select the most relevant, reputable options for the list theme.`;

const DEFAULT_LISTICLE_BODY = `You are an expert betting and gambling content writer. Write the bottom section of a listicle.

This section typically includes: methodology (how we ranked/picked), FAQ, disclaimers, or closing paragraphs.
Output valid HTML only: <p>, <h2>, <h3>, <ul>, <li>, <strong>, <a>. Use proper structure.
2-6 paragraphs or sections. Professional, helpful tone. Match the listicle theme.`;

export default function AdminControlPanelPage() {
  const [aiPrompt, setAiPrompt] = useState("");
  const [listicleIntro, setListicleIntro] = useState("");
  const [listiclePicks, setListiclePicks] = useState("");
  const [listicleBody, setListicleBody] = useState("");
  const [anthropicConfigured, setAnthropicConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/control-panel")
      .then((r) => r.json())
      .then((data) => {
        setAiPrompt(data.aiCompleteSystemPrompt ?? DEFAULT_AI_PROMPT);
        setListicleIntro(data.listicleIntroPrompt ?? DEFAULT_LISTICLE_INTRO);
        setListiclePicks(data.listiclePicksPrompt ?? DEFAULT_LISTICLE_PICKS);
        setListicleBody(data.listicleBodyPrompt ?? DEFAULT_LISTICLE_BODY);
        setAnthropicConfigured(data.anthropicConfigured ?? false);
      })
      .catch(() => setMessage({ type: "err", text: "Failed to load settings" }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/control-panel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aiCompleteSystemPrompt: aiPrompt.trim() || null,
          listicleIntroPrompt: listicleIntro.trim() || null,
          listiclePicksPrompt: listiclePicks.trim() || null,
          listicleBodyPrompt: listicleBody.trim() || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Save failed");
      }
      setMessage({ type: "ok", text: "Settings saved." });
    } catch (e) {
      setMessage({ type: "err", text: e instanceof Error ? e.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = (which?: "ai" | "intro" | "picks" | "body") => {
    if (!which || which === "ai") setAiPrompt(DEFAULT_AI_PROMPT);
    if (!which || which === "intro") setListicleIntro(DEFAULT_LISTICLE_INTRO);
    if (!which || which === "picks") setListiclePicks(DEFAULT_LISTICLE_PICKS);
    if (!which || which === "body") setListicleBody(DEFAULT_LISTICLE_BODY);
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
        Loading control panel…
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Control Panel</h1>
        <p className="mt-2 text-slate-600">
          Central settings for AI content, prompts, and admin preferences.
        </p>
      </div>

      {/* System Status */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">System Status</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          <div
            className={`flex items-center gap-2 rounded-lg px-4 py-2 ${
              anthropicConfigured ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${anthropicConfigured ? "bg-green-500" : "bg-amber-500"}`} />
            Claude API: {anthropicConfigured ? "Configured" : "Not configured"}
          </div>
        </div>
        {!anthropicConfigured && (
          <p className="mt-2 text-sm text-slate-600">
            Add ANTHROPIC_API_KEY to .env for AI Complete and Claude AI features.
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/admin/claude"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Claude AI Chat →
          </Link>
          <Link
            href="/admin/posts?type=product"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Products →
          </Link>
        </div>
      </section>

      {/* AI Content Prompt */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">AI Content Prompt</h2>
        <p className="mt-1 text-sm text-slate-600">
          System prompt for the &quot;AI Complete&quot; button when editing products. Leave empty to use the default.
        </p>
        <form onSubmit={handleSave} className="mt-4 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Product Review AI Complete</label>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={14}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
              placeholder={DEFAULT_AI_PROMPT}
              spellCheck={false}
            />
            <button type="button" onClick={() => resetToDefault("ai")} className="mt-2 text-sm text-slate-500 hover:text-slate-700">
              Reset to default
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Listicle AI – Intro</label>
            <p className="mt-0.5 text-xs text-slate-500">Used when generating listicle introductions. Leave empty for default.</p>
            <textarea
              value={listicleIntro}
              onChange={(e) => setListicleIntro(e.target.value)}
              rows={6}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
              placeholder={DEFAULT_LISTICLE_INTRO}
              spellCheck={false}
            />
            <button type="button" onClick={() => resetToDefault("intro")} className="mt-2 text-sm text-slate-500 hover:text-slate-700">
              Reset to default
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Listicle AI – Picks</label>
            <p className="mt-0.5 text-xs text-slate-500">Used when AI selects products for a listicle. Leave empty for default.</p>
            <textarea
              value={listiclePicks}
              onChange={(e) => setListiclePicks(e.target.value)}
              rows={12}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
              placeholder={DEFAULT_LISTICLE_PICKS}
              spellCheck={false}
            />
            <button type="button" onClick={() => resetToDefault("picks")} className="mt-2 text-sm text-slate-500 hover:text-slate-700">
              Reset to default
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Listicle AI – Body</label>
            <p className="mt-0.5 text-xs text-slate-500">Used when generating methodology, FAQ, and disclaimers. Leave empty for default.</p>
            <textarea
              value={listicleBody}
              onChange={(e) => setListicleBody(e.target.value)}
              rows={6}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
              placeholder={DEFAULT_LISTICLE_BODY}
              spellCheck={false}
            />
            <button type="button" onClick={() => resetToDefault("body")} className="mt-2 text-sm text-slate-500 hover:text-slate-700">
              Reset to default
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-felt px-4 py-2 font-medium text-white hover:bg-felt/90 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save All Prompts"}
            </button>
            <button
              type="button"
              onClick={() => resetToDefault()}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Reset all to default
            </button>
          </div>
        </form>
        {message && (
          <div
            className={`mt-4 rounded-lg p-3 ${
              message.type === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}
      </section>
    </div>
  );
}
