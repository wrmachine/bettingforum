import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { buildMetadata } from "@/lib/seo";
import { CALCULATORS } from "@/lib/calculators";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await buildMetadata("/calculators", {
    title: "Betting Calculators – Betting Forum",
    description:
      "Free betting calculators: odds converter, parlay, Kelly criterion, hedge, EV, no-vig, teaser, break-even, arbitrage, ROI, and bankroll tools.",
  });
  return {
    title: meta.title,
    description: meta.description,
    openGraph: meta.openGraph,
    twitter: meta.twitter,
    alternates: meta.alternates,
  };
}

export default function CalculatorsHubPage() {
  const essential = CALCULATORS.filter((c) => c.category === "essential");
  const advanced = CALCULATORS.filter((c) => c.category === "advanced");

  return (
    <div data-section="calculators">
      <PageHeader
        title="Online Betting Calculators"
        description="Kelly criterion, hedge, EV, no-vig, teaser, break-even, parlay, arbitrage, ROI, bankroll, and odds converter. Free and instant."
      />

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900">Essential Tools</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {essential.map((calc) => (
            <Link key={calc.slug} href={`/calculators/${calc.slug}`}>
              <div className="rounded-lg border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-sm">
                <h3 className="font-semibold text-slate-900">{calc.name}</h3>
                <p className="mt-2 text-sm text-slate-600">{calc.description}</p>
                <span className="mt-3 inline-block text-sm font-medium text-felt hover:underline">
                  Use calculator →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-slate-900">Advanced Tools</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {advanced.map((calc) => (
            <Link key={calc.slug} href={`/calculators/${calc.slug}`}>
              <div className="rounded-lg border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-sm">
                <h3 className="font-semibold text-slate-900">{calc.name}</h3>
                <p className="mt-2 text-sm text-slate-600">{calc.description}</p>
                <span className="mt-3 inline-block text-sm font-medium text-felt hover:underline">
                  Use calculator →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
