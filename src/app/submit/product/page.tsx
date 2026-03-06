"use client";

import { useState } from "react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PRODUCT_TYPES, serializeProductTypes } from "@/lib/product-types";

export default function SubmitProductPage() {
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
        const data = await res.json();
        router.push(`/products/${data.slug}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/submit" className="text-sm text-slate-600 hover:text-slate-900">
        ← Back to submit
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">Submit a Product</h1>
      <form onSubmit={handleSubmit} className="mt-8">
        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Name *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="e.g. BetMGM Sportsbook"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Brand Name
            </label>
            <input
              type="text"
              value={form.brandName}
              onChange={(e) => setForm((f) => ({ ...f, brandName: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="e.g. BetMGM"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Website URL
            </label>
            <input
              type="url"
              value={form.siteUrl}
              onChange={(e) => setForm((f) => ({ ...f, siteUrl: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Types
            </label>
            <p className="mt-1 text-xs text-slate-500">Select all that apply</p>
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
                        ? "border-accent bg-accent text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Short Description
            </label>
            <RichTextEditor
              value={form.excerpt}
              onChange={(html) => setForm((f) => ({ ...f, excerpt: html }))}
              placeholder="Brief description of the product"
              minHeight="4rem"
              allowMedia={false}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bonus Summary
            </label>
            <input
              type="text"
              value={form.bonusSummary}
              onChange={(e) => setForm((f) => ({ ...f, bonusSummary: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="e.g. $500 welcome bonus"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Min. Deposit
            </label>
            <input
              type="text"
              value={form.minDeposit}
              onChange={(e) => setForm((f) => ({ ...f, minDeposit: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="e.g. $10"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-accent px-4 py-2 font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
