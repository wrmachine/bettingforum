import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

const productTypeToForumSlug: Record<string, string> = {
  sportsbook: "bet-sportsbooks",
  casino: "bet-casinos",
  crypto: "bet-crypto",
  tool: "bet-tools",
};

export async function generateMetadata(): Promise<Metadata> {
  const meta = await buildMetadata("/categories", {
    title: "Categories – Betting Forum",
    description: "Browse betting products by category. Sportsbooks, casinos, crypto, tools, and tipsters.",
  });
  return { title: meta.title, description: meta.description, openGraph: meta.openGraph, twitter: meta.twitter, alternates: meta.alternates };
}

const categories = [
  { name: "Sportsbooks", slug: "sportsbook", count: 0 },
  { name: "Casinos", slug: "casino", count: 0 },
  { name: "Crypto Betting", slug: "crypto", count: 0 },
  { name: "Tools", slug: "tool", count: 0 },
  { name: "Tipsters", slug: "tipster", count: 0 },
];

export default function CategoriesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
      <p className="mt-2 text-slate-600">
        Browse betting products by category. Modeled on Product Hunt&apos;s
        category directory.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900">
          Top Product Categories
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link key={cat.slug} href={productTypeToForumSlug[cat.slug] ? `/f/${productTypeToForumSlug[cat.slug]}` : `/products?type=${cat.slug}`}>
              <div className="rounded-lg border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-sm">
                <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {cat.count} products
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-slate-900">
          Trending Categories
        </h2>
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-8">
          <p className="text-gray-500">
            Trending categories will appear here as the community grows.
          </p>
        </div>
      </section>
    </div>
  );
}
