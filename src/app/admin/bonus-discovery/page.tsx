"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getBonusTypeLabel } from "@/lib/bonus-types";

type Product = {
  id: string;
  brandName: string;
  siteUrl: string | null;
  productType: string;
  post: { slug: string };
};

type DiscoveredBonus = {
  id: string;
  productId: string;
  brandName: string;
  offerValue: string | null;
  promoCode: string | null;
  terms: string | null;
  claimUrl: string | null;
  sourceUrl: string | null;
  bonusType: string | null;
  status: string;
  createdAt: string;
  product: {
    id: string;
    brandName: string;
    post: { slug: string };
  };
};

export default function BonusDiscoveryPage() {
  const [discovered, setDiscovered] = useState<DiscoveredBonus[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "">("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [lastPublishedUrl, setLastPublishedUrl] = useState<string | null>(null);

  const fetchData = useCallback(async (statusFilter?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      const f = statusFilter ?? filter;
      if (f) params.set("status", f);
      const res = await fetch(`/api/admin/bonus-discovery?${params}`);
      const text = await res.text();
      let data: { discovered?: unknown[]; products?: unknown[]; error?: string } = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        setError(res.ok ? "Invalid response from server" : `Server error (${res.status})`);
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Failed to load");
        return;
      }
      setDiscovered(Array.isArray(data.discovered) ? (data.discovered as DiscoveredBonus[]) : []);
      setProducts(Array.isArray(data.products) ? (data.products as Product[]) : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDiscover = async () => {
    if (!selectedProduct) {
      setError("Select a casino/sportsbook first");
      return;
    }
    setDiscovering(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/bonus-discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedProduct }),
      });
      const text = await res.text();
      let data: { discovered?: number; error?: string } = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(res.ok ? "Invalid response" : `Server error (${res.status})`);
      }
      if (!res.ok) throw new Error(data.error ?? "Discovery failed");
      const count = data.discovered ?? 0;
      setMessage(
        count > 0
          ? `Found ${count} bonus code(s). Review below.`
          : "No bonus offers found. Try a product with a website URL, or add one in product edit."
      );
      setFilter("pending");
      fetchData("pending");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Discovery failed");
    } finally {
      setDiscovering(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/bonus-discovery/${id}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Approve failed");
      setMessage("Bonus published!");
      setLastPublishedUrl(data.url ?? null);
      fetchData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Approve failed");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/bonus-discovery/${id}/reject`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Reject failed");
      }
      fetchData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reject failed");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Bonus Discovery</h1>
      <p className="mt-1 text-slate-600">
        Claude scans casinos/sportsbooks for bonus codes. Review and publish the ones you want.
      </p>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">1. Find Bonus Codes</h2>
        <p className="mt-1 text-sm text-slate-600">
          Select a product (casino or sportsbook), then run discovery. Claude will fetch their site and extract offers.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Product</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="mt-1 rounded border border-slate-300 px-3 py-2"
            >
              <option value="">
                {products.length === 0 ? "No products — add some in Admin → Posts" : "— Select casino or sportsbook —"}
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.brandName}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleDiscover}
            disabled={discovering}
            className="rounded bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {discovering ? "Scanning..." : "Run Discovery"}
          </button>
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">2. Review & Publish</h2>
          <div className="flex gap-2">
            {(["", "pending", "approved", "rejected"] as const).map((s) => (
              <button
                key={s || "all"}
                type="button"
                onClick={() => setFilter(s)}
                className={`rounded px-3 py-1.5 text-sm font-medium ${
                  filter === s
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {s || "All"}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
        )}
        {message && (
          <div className="mt-4 rounded border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            {message}
            {lastPublishedUrl && (
              <Link
                href={lastPublishedUrl}
                className="ml-2 font-medium underline hover:no-underline"
              >
                View bonus →
              </Link>
            )}
          </div>
        )}

        {loading ? (
          <p className="mt-6 text-slate-500">Loading...</p>
        ) : discovered.length === 0 ? (
          <p className="mt-6 text-slate-500">
            No discovered bonuses yet. Run discovery for a product above.
          </p>
        ) : (
          <div className="mt-6 space-y-3">
            {discovered.map((d) => (
              <div
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 p-4"
              >
                <div>
                  <span className="font-medium text-slate-900">{d.brandName}</span>
                  {d.offerValue && (
                    <span className="ml-2 text-slate-600">{d.offerValue}</span>
                  )}
                  {d.promoCode && (
                    <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 font-mono text-sm">
                      {d.promoCode}
                    </span>
                  )}
                  {d.bonusType && (
                    <span className="ml-2 rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                      {getBonusTypeLabel(d.bonusType)}
                    </span>
                  )}
                  {d.terms && (
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{d.terms}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      d.status === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : d.status === "approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {d.status}
                  </span>
                  {d.status === "pending" && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleApprove(d.id)}
                        className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                      >
                        Publish
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(d.id)}
                        className="rounded border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="mt-6 text-sm text-slate-500">
        Requires ANTHROPIC_API_KEY. Claude fetches the product&apos;s website and extracts bonus offers.
      </p>
    </div>
  );
}
