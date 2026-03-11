"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { BonusCard } from "./BonusCard";

type SortOption = "top" | "new" | "expiring";
type TypeFilter = "all" | "sportsbook" | "casino" | "crypto";

const VALID_TYPES: TypeFilter[] = ["all", "sportsbook", "casino", "crypto"];

type BonusItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  offerValue: string | null;
  promoCode: string | null;
  votes: number;
  comments: number;
  featured?: boolean;
  product: {
    brandName: string;
    slug: string;
    siteUrl: string | null;
    logoUrl?: string | null;
  } | null;
};

type ProviderOption = { slug: string; brandName: string };

export function BonusesIndex() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const urlSort = searchParams.get("sort");
  const urlType = searchParams.get("type");
  const urlProvider = searchParams.get("provider");
  const sort: SortOption = urlSort === "new" ? "new" : urlSort === "expiring" ? "expiring" : "top";
  const type: TypeFilter = urlType && VALID_TYPES.includes(urlType as TypeFilter) ? (urlType as TypeFilter) : "all";
  const provider = urlProvider ?? "";

  const [bonuses, setBonuses] = useState<BonusItem[]>([]);
  const [providers, setProviders] = useState<ProviderOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSortChange = (newSort: SortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort === "top") params.delete("sort");
    else params.set("sort", newSort);
    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleTypeChange = (newType: TypeFilter) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newType === "all") params.delete("type");
    else params.set("type", newType);
    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleProviderChange = (newProvider: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!newProvider) params.delete("provider");
    else params.set("provider", newProvider);
    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  };

  useEffect(() => {
    setError(null);
    setLoading(true);
    const params = new URLSearchParams({ sort });
    if (type !== "all") params.set("type", type);
    if (provider) params.set("provider", provider);
    fetch(`/api/bonuses?${params}`)
      .then(async (r) => {
        const text = await r.text();
        const data = text ? JSON.parse(text) : [];
        if (!r.ok) {
          const err = typeof data === "object" && data && "error" in data ? (data as { error: string }).error : "Failed to load bonuses";
          throw new Error(err);
        }
        return data;
      })
      .then((data) => {
        if (data && typeof data === "object" && "error" in data) {
          setError((data as { error: string }).error);
          setBonuses([]);
          return;
        }
        const response = data as { bonuses?: BonusItem[]; providers?: ProviderOption[] } | BonusItem[];
        if (response && typeof response === "object" && "bonuses" in response) {
          setBonuses(Array.isArray(response.bonuses) ? response.bonuses : []);
          setProviders(Array.isArray(response.providers) ? response.providers : []);
        } else {
          setBonuses(Array.isArray(response) ? response : []);
        }
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load bonuses");
        setBonuses([]);
      })
      .finally(() => setLoading(false));
  }, [sort, type, provider]);

  return (
    <div className="mt-8 min-w-0">
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <div>
          <label className="sr-only">Filter by provider</label>
          <select
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="">All Providers</option>
            {providers.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.brandName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="sr-only">Filter by type</label>
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value as TypeFilter)}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="all">All Types</option>
            <option value="sportsbook">Sportsbook</option>
            <option value="casino">Casino</option>
            <option value="crypto">Crypto</option>
          </select>
        </div>
        <div>
          <label className="sr-only">Sort by</label>
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="top">Top</option>
            <option value="new">New</option>
            <option value="expiring">Expiring Soon</option>
          </select>
        </div>
      </div>
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</p>
      )}
      {loading ? (
        <p className="text-slate-600">Loading...</p>
      ) : bonuses.length === 0 && !error ? (
        <p className="text-slate-500">No bonuses yet. Be the first to submit one!</p>
      ) : (
        <div className="flex flex-col gap-4 rounded-xl bg-[#F2F4F7] p-4">
          {bonuses.map((bonus) => (
            <BonusCard key={bonus.id} bonus={bonus} />
          ))}
        </div>
      )}
    </div>
  );
}
