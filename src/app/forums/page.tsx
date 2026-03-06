import type { Metadata } from "next";
import Link from "next/link";
import { FORUM_CONFIGS, getForumsWithOverrides } from "@/lib/forums";
import { buildMetadata } from "@/lib/seo";

const icons: Record<string, React.ReactNode> = {
  globe: (
    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  ),
  chart: (
    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  question: (
    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  hand: (
    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
    </svg>
  ),
  gift: (
    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2v-6a2 2 0 00-2-2M5 12h14" />
    </svg>
  ),
  sportsbook: (
    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-header-green text-sm font-bold text-white">S</span>
  ),
  casino: (
    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-sm font-bold text-white">C</span>
  ),
  crypto: (
    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 text-sm font-bold text-white">₿</span>
  ),
  tool: (
    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  bonus: (
    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">B</span>
  ),
  article: (
    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  nfl: (
    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-700 text-xs font-bold text-white">NFL</span>
  ),
  nba: (
    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600 text-xs font-bold text-white">NBA</span>
  ),
  mlb: (
    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 text-xs font-bold text-white">MLB</span>
  ),
  nhl: (
    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-white">NHL</span>
  ),
  soccer: (
    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-base">⚽</span>
  ),
  mma: (
    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-700 text-xs font-bold text-white">MMA</span>
  ),
  tennis: (
    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-lime-600 text-base">🎾</span>
  ),
  golf: (
    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-700 text-base">⛳</span>
  ),
  boxing: (
    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-800 text-base">🥊</span>
  ),
  esports: (
    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600 text-base">🎮</span>
  ),
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const meta = await buildMetadata("/forums", {
      title: "All Forums – Betting Forum",
      description: "Browse all community forums: topic discussions, product reviews, bonuses, strategy, and more.",
    });
    return {
      title: meta.title,
      description: meta.description,
      keywords: meta.keywords,
      openGraph: meta.openGraph,
      twitter: meta.twitter,
      alternates: meta.alternates,
    };
  } catch {
    return {
      title: "All Forums – Betting Forum",
      description: "Browse all community forums on sports betting and online gambling.",
    };
  }
}

function ForumCard({ forum }: { forum: (typeof FORUM_CONFIGS)[number] }) {
  const icon = icons[forum.icon] ?? icons.globe;
  return (
    <Link
      href={`/f/${forum.slug}`}
      className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-felt/10 group-hover:text-felt">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-slate-900 group-hover:text-felt">{forum.name}</h3>
        <p className="mt-1 text-sm text-slate-600">{forum.description}</p>
      </div>
      <svg className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-felt" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

export default async function ForumsPage() {
  const allForums = await getForumsWithOverrides();
  const topicForums = allForums.filter((f) => f.category === "topic");
  const contentForums = allForums.filter((f) => f.category === "content");
  const sportsForums = allForums.filter((f) => f.category === "sports");
  const productForums = allForums.filter((f) => f.category === "product");
  const bonusForums = allForums.filter((f) => f.category === "bonus");

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">All Forums</h1>
        <p className="mt-2 text-slate-600">
          Browse and join discussions across our community forums.
        </p>

        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Topic Forums</h2>
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {topicForums.map((forum) => (
              <ForumCard key={forum.slug} forum={forum} />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Articles</h2>
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {contentForums.map((forum) => (
              <ForumCard key={forum.slug} forum={forum} />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Sports</h2>
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {sportsForums.map((forum) => (
              <ForumCard key={forum.slug} forum={forum} />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Product Forums</h2>
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {productForums.map((forum) => (
              <ForumCard key={forum.slug} forum={forum} />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Bonus</h2>
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {bonusForums.map((forum) => (
              <ForumCard key={forum.slug} forum={forum} />
            ))}
          </div>
        </section>
    </div>
  );
}
