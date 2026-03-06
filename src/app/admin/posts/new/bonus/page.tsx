"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ProductOption = { id: string; title: string };

export default function AdminNewBonusPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    offerValue: "",
    promoCode: "",
    terms: "",
    claimUrl: "",
    productId: "",
  });

  useEffect(() => {
    fetch("/api/posts?type=product&sort=top")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(
            data
              .filter((p: { type: string }) => p.type === "product")
              .map((p: { productId?: string; id: string; title: string }) => ({
                id: p.productId ?? p.id,
                title: p.title,
              }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "bonus",
          title: form.title,
          excerpt: form.excerpt || null,
          bonus: {
            offerValue: form.offerValue || null,
            promoCode: form.promoCode || null,
            terms: form.terms || null,
            claimUrl: form.claimUrl || null,
            productId: form.productId || null,
          },
        }),
      });
      if (res.ok) {
        router.push("/admin/posts?type=bonus");
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
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Add Bonus</h1>
      <p className="mt-1 text-slate-600">Create a new bonus or promo offer.</p>
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="e.g. 100% up to $500 Welcome Bonus"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Offer Value</label>
            <input
              type="text"
              value={form.offerValue}
              onChange={(e) => setForm((f) => ({ ...f, offerValue: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="e.g. 100% up to $500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Promo Code</label>
            <input
              type="text"
              value={form.promoCode}
              onChange={(e) => setForm((f) => ({ ...f, promoCode: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="e.g. BET500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Claim URL</label>
            <input
              type="url"
              value={form.claimUrl}
              onChange={(e) => setForm((f) => ({ ...f, claimUrl: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Product (optional)</label>
            <select
              value={form.productId}
              onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="">— Select —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-felt px-6 py-2 font-medium text-white hover:bg-felt/90 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Bonus"}
          </button>
        </div>
      </form>
    </div>
  );
}
