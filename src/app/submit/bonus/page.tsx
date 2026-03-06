"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RichTextEditor } from "@/components/RichTextEditor";

type ProductOption = { id: string; title: string };

export default function SubmitBonusPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const bonusTypes = [
    { slug: "first-time", label: "First Time" },
    { slug: "reload", label: "Reload" },
    { slug: "no-deposit", label: "No Deposit" },
  ];

  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    body: "",
    offerValue: "",
    promoCode: "",
    terms: "",
    claimUrl: "",
    expiresAt: "",
    productId: "",
    bonusType: "", // first-time | reload | no-deposit
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
      const payload: Record<string, unknown> = {
        type: "bonus",
        title: form.title,
        excerpt: form.excerpt || null,
        body: form.body || null,
        bonus: {
          offerValue: form.offerValue || null,
          promoCode: form.promoCode || null,
          terms: form.terms || null,
          claimUrl: form.claimUrl || null,
          productId: form.productId || null,
        },
        tags: form.bonusType ? [form.bonusType] : [],
      };
      if (form.expiresAt) {
        (payload.bonus as Record<string, unknown>).expiresAt = form.expiresAt;
      }
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/bonuses/${data.slug}`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to submit");
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
      <h1 className="mt-4 text-3xl font-bold text-slate-900">Submit a Bonus</h1>
      <p className="mt-2 text-slate-600">
        Share a welcome bonus, promo code, or special offer from a sportsbook or casino.
      </p>
      <form onSubmit={handleSubmit} className="mt-8">
        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="e.g. 100% up to $500 Welcome Bonus"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Offer Value</label>
            <input
              type="text"
              value={form.offerValue}
              onChange={(e) => setForm((f) => ({ ...f, offerValue: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="e.g. 100% up to $500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Promo Code</label>
            <input
              type="text"
              value={form.promoCode}
              onChange={(e) => setForm((f) => ({ ...f, promoCode: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="e.g. BET500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Claim URL</label>
            <input
              type="url"
              value={form.claimUrl}
              onChange={(e) => setForm((f) => ({ ...f, claimUrl: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bonus Type</label>
            <select
              value={form.bonusType}
              onChange={(e) => setForm((f) => ({ ...f, bonusType: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">— Select (optional) —</option>
              {bonusTypes.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">Helps categorize your bonus (First Time, Reload, No Deposit)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Brand / Product</label>
            <select
              value={form.productId}
              onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">— Select (optional) —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Short Description</label>
            <RichTextEditor
              value={form.excerpt}
              onChange={(html) => setForm((f) => ({ ...f, excerpt: html }))}
              placeholder="Brief summary of the offer"
              minHeight="4rem"
              allowMedia={false}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Terms & Conditions</label>
            <RichTextEditor
              value={form.terms}
              onChange={(html) => setForm((f) => ({ ...f, terms: html }))}
              placeholder="T&C summary (e.g. 21+, 5x rollover, 30 days)"
              minHeight="6rem"
              allowMedia={false}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Expires (optional)</label>
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Description</label>
            <RichTextEditor
              value={form.body}
              onChange={(html) => setForm((f) => ({ ...f, body: html }))}
              placeholder="Additional details (optional)"
              minHeight="8rem"
              allowMedia={false}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-accent px-4 py-2 font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Bonus"}
          </button>
        </div>
      </form>
    </div>
  );
}
