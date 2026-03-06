import type { Metadata } from "next";
import { Suspense } from "react";
import { BonusesIndex } from "@/components/BonusesIndex";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await buildMetadata("/bonuses", {
    title: "Bonuses – Betting Forum",
    description:
      "Discover the best betting bonuses, promo codes, and special offers from top sportsbooks and casinos. Community-ranked and regularly updated.",
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

export default function BonusesPage() {
  return (
    <div className="min-w-0">
      <Suspense fallback={<p className="text-slate-600">Loading...</p>}>
        <BonusesIndex />
      </Suspense>
    </div>
  );
}
