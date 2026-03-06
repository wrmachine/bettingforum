"use client";

import { useEffect, useState } from "react";

interface SitemapConfig {
  id: string;
  pathPattern: string;
  priority: number;
  changeFreq: string;
  enabled: boolean;
}

export default function AdminSeoSitemapPage() {
  const [items, setItems] = useState<SitemapConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/seo/sitemap-settings")
      .then((r) => r.json())
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const loadPreview = () => {
    setPreview("loading");
    fetch("/sitemap.xml")
      .then((r) => r.text())
      .then(setPreview)
      .catch(() => setPreview("Failed to load sitemap"));
  };

  if (loading) return <div className="text-slate-500">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Sitemap Configuration</h1>
      <p className="mt-1 text-slate-600">
        The sitemap is auto-generated from published posts. Configure path priorities and change frequencies below.
      </p>

      <div className="mt-6 flex gap-4">
        <a
          href="/sitemap.xml"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
        >
          View Sitemap
        </a>
        <button
          onClick={loadPreview}
          className="rounded border border-slate-300 px-4 py-2 hover:bg-slate-50"
        >
          Preview XML
        </button>
      </div>

      {preview && (
        <div className="mt-6">
          <h3 className="font-semibold text-slate-700">Sitemap Preview</h3>
          <pre className="mt-2 max-h-96 overflow-auto rounded border border-slate-200 bg-slate-50 p-4 text-xs">
            {preview === "loading" ? "Loading..." : preview}
          </pre>
        </div>
      )}

      <div className="mt-10">
        <h3 className="font-semibold text-slate-700">Default Sitemap Entries</h3>
        <p className="mt-1 text-sm text-slate-500">
          These paths are included by default. Add custom config to override priority/changeFreq.
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          <li><code className="rounded bg-slate-100 px-1">/</code> — Home (priority 1, daily)</li>
          <li><code className="rounded bg-slate-100 px-1">/products</code> — Products index (0.9, daily)</li>
          <li><code className="rounded bg-slate-100 px-1">/threads</code> — Threads index (0.9, hourly)</li>
          <li><code className="rounded bg-slate-100 px-1">/listicles</code> — Listicles index (0.8, daily)</li>
          <li><code className="rounded bg-slate-100 px-1">/categories</code> — Categories (0.7, weekly)</li>
          <li><code className="rounded bg-slate-100 px-1">/products/[slug]</code> — Product pages (0.8, weekly)</li>
          <li><code className="rounded bg-slate-100 px-1">/threads/[slug]</code> — Thread pages (0.8, weekly)</li>
          <li><code className="rounded bg-slate-100 px-1">/listicles/[slug]</code> — Listicle pages (0.8, weekly)</li>
        </ul>
      </div>

      {items.length > 0 && (
        <div className="mt-10">
          <h3 className="font-semibold text-slate-700">Custom Sitemap Config</h3>
          <div className="mt-4 space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded border border-slate-200 bg-white px-4 py-2"
              >
                <code className="font-mono text-sm">{item.pathPattern}</code>
                <span className="text-sm text-slate-500">
                  priority {item.priority} · {item.changeFreq} · {item.enabled ? "enabled" : "disabled"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
