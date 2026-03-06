import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductsIndex } from "@/components/ProductsIndex";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await buildMetadata("/products", {
    title: "Products – Betting Forum",
    description: "Browse sportsbooks, casinos, crypto betting, tools, and tipsters. Discover the best betting products ranked by the community.",
  });
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: meta.openGraph,
    twitter: meta.twitter,
    alternates: meta.alternates,
  };
}

export default function ProductsPage() {
  return (
    <div className="min-w-0">
      <Suspense fallback={<p className="text-slate-600">Loading...</p>}>
        <ProductsIndex />
      </Suspense>
    </div>
  );
}
