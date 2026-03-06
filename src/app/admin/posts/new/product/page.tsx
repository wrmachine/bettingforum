"use client";

import { useState } from "react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PRODUCT_TYPES, serializeProductTypes } from "@/lib/product-types";

export default function AdminNewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    brandName: "",
    siteUrl: "",
    productTypes: ["sportsbook"] as string[],
    bonusSummary: "",
    minDeposit: "",
  });

  const toggleProductType = (type: string) => {
    setForm((f) => ({
      ...f,
      productTypes: f.productTypes.includes(type)
        ? f.productTypes.filter((t) => t !== type)
        : f.productTypes.length === 0
          ? [type]
          : [...f.productTypes, type],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const productTypesJson = form.productTypes.length > 0
        ? serializeProductTypes(form.productTypes as ("sportsbook" | "casino" | "crypto" | "tool" | "tipster")[])
        : serializeProductTypes(["sportsbook"]);
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "product",
          title: form.title || form.brandName,
          excerpt: form.excerpt,
          product: {
            brandName: form.brandName || form.title,
            siteUrl: form.siteUrl || null,
            productType: productTypesJson,
            bonusSummary: form.bonusSummary || null,
            minDeposit: form.minDeposit || null,
          },
        }),
      });
      if (res.ok) {
        router.push("/admin/posts?type=product");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link href="/admin/posts" className="text-sm text-slate-600 hover:text-slate-900">
        ← Back to Posts
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Add Product</h1>
      <p className="mt-1 text-slate-600">Add a sportsbook, casino, or other product.</p>
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Product Name *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="e.g. BetMGM Sportsbook"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Brand Name</label>
            <input
              type="text"
              value={form.brandName}
              onChange={(e) => setForm((f) => ({ ...f, brandName: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="e.g. BetMGM"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Website URL</label>
            <input
              type="url"
              value={form.siteUrl}
              onChange={(e) => setForm((f) => ({ ...f, siteUrl: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Product Types</label>
            <p className="mt-1 text-xs text-slate-500">Select all that apply (brands can be sportsbook, casino, etc.)</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRODUCT_TYPES.map((t) => {
                const active = form.productTypes.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleProductType(t)}
                    className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "border-felt bg-felt text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Short Description</label>
            <RichTextEditor
              value={form.excerpt}
              onChange={(html) => setForm((f) => ({ ...f, excerpt: html }))}
              placeholder="Brief description"
              minHeight="4rem"
              allowMedia={false}
              uploadEndpoint="/api/admin/upload"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Bonus Summary</label>
            <input
              type="text"
              value={form.bonusSummary}
              onChange={(e) => setForm((f) => ({ ...f, bonusSummary: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="e.g. $500 welcome bonus"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-felt px-6 py-2 font-medium text-white hover:bg-felt/90 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
