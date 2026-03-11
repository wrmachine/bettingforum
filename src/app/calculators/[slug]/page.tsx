import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { buildMetadata, buildBreadcrumbSchema, getSchemaEnabled } from "@/lib/seo";
import { getBaseUrl } from "@/lib/base-url";
import { SchemaJsonLd } from "@/components/SchemaJsonLd";
import { getCalculator, CALCULATORS } from "@/lib/calculators";
import { OddsConverterCalc } from "@/components/calculators/OddsConverterCalc";
import { ParlayCalc } from "@/components/calculators/ParlayCalc";
import { ArbitrageCalc } from "@/components/calculators/ArbitrageCalc";
import { RoiCalc } from "@/components/calculators/RoiCalc";
import { BankrollCalc } from "@/components/calculators/BankrollCalc";
import { KellyCalc } from "@/components/calculators/KellyCalc";
import { HedgeCalc } from "@/components/calculators/HedgeCalc";
import { EvCalc } from "@/components/calculators/EvCalc";
import { NoVigCalc } from "@/components/calculators/NoVigCalc";
import { TeaserCalc } from "@/components/calculators/TeaserCalc";
import { BreakEvenCalc } from "@/components/calculators/BreakEvenCalc";

const CALC_COMPONENTS: Record<string, React.ComponentType> = {
  "odds-converter": OddsConverterCalc,
  parlay: ParlayCalc,
  arbitrage: ArbitrageCalc,
  roi: RoiCalc,
  bankroll: BankrollCalc,
  kelly: KellyCalc,
  hedge: HedgeCalc,
  ev: EvCalc,
  "no-vig": NoVigCalc,
  teaser: TeaserCalc,
  "break-even": BreakEvenCalc,
};

export async function generateStaticParams() {
  return CALCULATORS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const calc = getCalculator(slug);
  if (!calc) return {};
  const path = `/calculators/${slug}`;
  const meta = await buildMetadata(path, {
    title: `${calc.name} – Betting Forum`,
    description: calc.description,
  });
  return {
    title: meta.title,
    description: meta.description,
    openGraph: meta.openGraph,
    twitter: meta.twitter,
    alternates: meta.alternates,
  };
}

export default async function CalculatorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const calc = getCalculator(slug);
  if (!calc) notFound();

  const CalcComponent = CALC_COMPONENTS[slug];
  if (!CalcComponent) notFound();

  const base = await getBaseUrl();
  const schemas = [];
  const breadcrumbEnabled = await getSchemaEnabled("breadcrumb");
  if (breadcrumbEnabled) {
    schemas.push(
      buildBreadcrumbSchema([
        { name: "Home", url: base },
        { name: "Calculators", url: `${base}/calculators` },
        { name: calc.name, url: `${base}/calculators/${slug}` },
      ])
    );
  }

  return (
    <>
      {schemas.length > 0 && <SchemaJsonLd data={schemas} />}
      <div data-section="calculators">
        <PageHeader
          title={calc.name}
          description={calc.description}
        />
        <div className="mt-6 flex flex-col gap-8 pt-[50px] lg:flex-row">
          <div className="min-w-0 flex-1">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
              <CalcComponent />
            </div>
          </div>
          <aside className="shrink-0 lg:w-72">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                More Calculators
              </h3>
              <ul className="mt-4 space-y-2">
                {CALCULATORS.filter((c) => c.slug !== slug).map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/calculators/${c.slug}`}
                      className="text-sm text-slate-700 hover:text-felt hover:underline"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/calculators"
                className="mt-4 inline-block text-sm font-medium text-felt hover:underline"
              >
                ← All calculators
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
