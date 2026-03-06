"use client";

import { useEffect, useState } from "react";

interface SchemaConfig {
  id: string;
  schemaType: string;
  enabled: boolean;
  config: string;
}

export default function AdminSeoSchemaPage() {
  const [items, setItems] = useState<SchemaConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/seo/schema-config")
      .then((r) => r.json())
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const schemaTypes = [
    { type: "organization", desc: "Organization schema on homepage" },
    { type: "website", desc: "WebSite schema with SearchAction" },
    { type: "breadcrumb", desc: "BreadcrumbList on detail pages" },
    { type: "product", desc: "Product schema + AggregateRating from user reviews" },
    { type: "discussionForumPosting", desc: "Forum threads (UGC) – commentCount, votes" },
    { type: "article", desc: "Article schema on listicles (curated lists)" },
    { type: "listicle", desc: "ItemList schema on listicle pages" },
  ];

  const toggle = async (item: SchemaConfig) => {
    await fetch(`/api/admin/seo/schema-config/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !item.enabled }),
    });
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, enabled: !i.enabled } : i))
    );
  };

  const ensureExists = async (schemaType: string) => {
    const existing = items.find((i) => i.schemaType === schemaType);
    if (existing) return;
    const res = await fetch("/api/admin/seo/schema-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schemaType, enabled: true, config: {} }),
    });
    const created = await res.json();
    setItems((prev) => [...prev, created]);
  };

  if (loading) return <div className="text-slate-500">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Schema (JSON-LD) Configuration</h1>
      <p className="mt-1 text-slate-600">
        Structured data helps search engines understand your content. Enable schema types below.
      </p>

      <div className="mt-10 space-y-4">
        {schemaTypes.map(({ type, desc }) => {
          const item = items.find((i) => i.schemaType === type);
          const enabled = item?.enabled ?? true;
          return (
            <div
              key={type}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
            >
              <div>
                <h3 className="font-semibold text-slate-900">{type}</h3>
                <p className="text-sm text-slate-500">{desc}</p>
              </div>
              <div className="flex items-center gap-4">
                {!item && (
                  <button
                    onClick={() => ensureExists(type)}
                    className="text-sm text-emerald-600 hover:underline"
                  >
                    Add
                  </button>
                )}
                {item && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={() => toggle(item)}
                    />
                    Enabled
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h3 className="font-semibold text-slate-700">Schema Types Used</h3>
        <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
          <li><strong>Organization</strong> — Site identity, shown on homepage</li>
          <li><strong>WebSite</strong> — Site-wide with sitelinks search box</li>
          <li><strong>BreadcrumbList</strong> — Navigation path on detail pages</li>
          <li><strong>Product</strong> — Product pages with AggregateRating from user reviews</li>
          <li><strong>DiscussionForumPosting</strong> — Forum threads (UGC: author, votes, commentCount)</li>
          <li><strong>Article</strong> — Listicles (user-curated lists)</li>
          <li><strong>ItemList</strong> — Listicle ranked items</li>
        </ul>
      </div>
    </div>
  );
}
