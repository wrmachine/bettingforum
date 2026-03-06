"use client";

import { useEffect, useState } from "react";

export default function AdminSeoSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/seo/settings")
      .then((r) => r.json())
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/seo/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteName: settings.siteName ?? "Betting Forum",
          defaultTitle: settings.defaultTitle ?? "Betting Forum – Sports betting & online gambling community",
          defaultDescription:
            settings.defaultDescription ??
            "The Reddit of sports betting. Discuss strategies, share tips, and discover the best sportsbooks, casinos, and tools — ranked by the community.",
          defaultOgImage: settings.defaultOgImage ?? "",
          twitterHandle: settings.twitterHandle || "",
          robotsAllow: settings.robotsAllow !== "false",
          robotsDisallowPaths: settings.robotsDisallowPaths
            ? JSON.parse(settings.robotsDisallowPaths)
            : ["/admin", "/account", "/api"],
        }),
      });
      const data = await res.json();
      setSettings(data);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-slate-500">Loading...</div>;

  const base = typeof window !== "undefined" ? window.location.origin : "";
  const defaultOg = settings.defaultOgImage || `${base}/og-default.png`;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Global SEO Settings</h1>
      <p className="mt-1 text-slate-600">Defaults applied site-wide. Override per-page in Page Meta.</p>

      <form onSubmit={handleSave} className="mt-8 max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700">Site Name</label>
          <input
            type="text"
            value={settings.siteName ?? "Betting Forum"}
            onChange={(e) => setSettings((s) => ({ ...s, siteName: e.target.value }))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Default Title</label>
          <input
            type="text"
            value={settings.defaultTitle ?? ""}
            onChange={(e) => setSettings((s) => ({ ...s, defaultTitle: e.target.value }))}
            placeholder="Betting Forum – Sports betting & online gambling community"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Default Description</label>
          <textarea
            value={settings.defaultDescription ?? ""}
            onChange={(e) => setSettings((s) => ({ ...s, defaultDescription: e.target.value }))}
            placeholder="The Reddit of sports betting..."
            rows={3}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Default OG Image URL</label>
          <input
            type="url"
            value={settings.defaultOgImage ?? defaultOg}
            onChange={(e) => setSettings((s) => ({ ...s, defaultOgImage: e.target.value }))}
            placeholder={`${base}/og-default.png`}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Twitter Handle (e.g. @bettingforum)</label>
          <input
            type="text"
            value={settings.twitterHandle ?? ""}
            onChange={(e) => setSettings((s) => ({ ...s, twitterHandle: e.target.value }))}
            placeholder="@bettingforum"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Allow Crawling</label>
          <select
            value={settings.robotsAllow ?? "true"}
            onChange={(e) => setSettings((s) => ({ ...s, robotsAllow: e.target.value }))}
            className="mt-1 rounded border border-slate-300 px-3 py-2"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Disallow Paths (JSON array)</label>
          <input
            type="text"
            value={
              settings.robotsDisallowPaths ??
              '["/admin","/account","/api"]'
            }
            onChange={(e) => setSettings((s) => ({ ...s, robotsDisallowPaths: e.target.value }))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm"
          />
          <p className="mt-1 text-xs text-slate-500">Paths to disallow in robots.txt</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
