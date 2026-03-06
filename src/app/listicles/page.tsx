import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { ListiclesIndex } from "@/components/ListiclesIndex";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await buildMetadata("/listicles", {
    title: "Best Of – Betting Forum",
    description: "Curated lists of the best betting products, ranked and reviewed by the community.",
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

export default function ListiclesPage() {
  return (
    <div className="min-w-0">
      <h1 className="text-3xl font-bold text-slate-900">Best Of</h1>
      <p className="mt-1 text-slate-600">
        Curated lists of the best betting products, sportsbooks, and casinos—ranked by the community.
      </p>
      <ListiclesIndex />
    </div>
  );
}
