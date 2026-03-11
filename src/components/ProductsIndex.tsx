"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ProductCard } from "./ProductCard";

type SortOption = "top" | "new" | "reviews";
type TypeFilter = "all" | "sportsbook" | "casino" | "crypto" | "tool" | "tipster";

const VALID_TYPES: TypeFilter[] = ["all", "sportsbook", "casino", "crypto", "tool", "tipster"];

type ProductItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  type: string;
  votes: number;
  comments: number;
  tags: string[];
  productType?: string;
  bonusSummary?: string | null;
  siteUrl?: string | null;
  logoUrl?: string | null;
  rating?: number | null;
  reviewCount?: number;
};

export function ProductsIndex() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const urlType = searchParams.get("type");
  const initialType = urlType && VALID_TYPES.includes(urlType as TypeFilter) ? (urlType as TypeFilter) : "all";

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [sort, setSort] = useState<SortOption>("top");
  const [type, setType] = useState<TypeFilter>(initialType);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setType(initialType);
  }, [initialType]);

  const handleTypeChange = (newType: TypeFilter) => {
    setType(newType);
    const params = new URLSearchParams(searchParams.toString());
    if (newType === "all") params.delete("type");
    else params.set("type", newType);
    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  };

  useEffect(() => {
    setError(null);
    setLoading(true);
    const params = new URLSearchParams({ sort: sort || "top" });
    params.set("type", type === "all" ? "product" : type);
    fetch(`/api/posts?${params}`)
      .then(async (r) => {
        if (!r.ok) return [];
        const text = await r.text();
        return text ? JSON.parse(text) : [];
      })
      .then((data) => {
        if (data && typeof data === "object" && "error" in data) {
          setError((data as { error: string }).error);
          setProducts([]);
          return;
        }
        setProducts(
          (Array.isArray(data) ? data : [])
            .filter((p: { type: string }) => p.type === "product")
            .map((p: { id: string; title: string; slug: string; excerpt: string | null; type: string; votes: number; comments: number; tags: string[]; productType?: string; bonusSummary?: string | null; siteUrl?: string | null; rating?: number | null; reviewCount?: number }) => ({
              id: p.id,
              title: p.title,
              slug: p.slug,
              excerpt: p.excerpt ?? "",
              type: p.type,
              votes: p.votes,
              comments: p.comments,
              tags: p.tags ?? [],
              productType: p.productType,
              bonusSummary: p.bonusSummary,
              siteUrl: p.siteUrl,
              rating: p.rating,
              reviewCount: p.reviewCount ?? 0,
              logoUrl: null,
            }))
        );
      })
      .catch((err) => {
        setError("Failed to load products");
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [sort, type]);

  return (
    <div className="mt-8 min-w-0">
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <div>
          <label className="sr-only">Sort by</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="top">Top</option>
            <option value="new">New</option>
            <option value="reviews">Most Reviewed</option>
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
            <option value="tool">Tool</option>
            <option value="tipster">Tipster</option>
          </select>
        </div>
      </div>
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</p>
      )}
      {loading ? (
        <p className="text-slate-600">Loading...</p>
      ) : products.length === 0 && !error ? (
        <p className="text-slate-500">No products found. Try a different filter.</p>
      ) : (
        <div className="flex flex-col gap-4 rounded-xl bg-[#F2F4F7] p-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
