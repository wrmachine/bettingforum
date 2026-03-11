"use client";

import { usePathname } from "next/navigation";

export function BonusesPageHeader() {
  const pathname = usePathname();
  const isIndex = pathname === "/bonuses" || pathname === "/bonuses/";

  if (!isIndex) return null;

  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold uppercase tracking-tight text-black sm:text-3xl">
        Best Betting Bonuses
      </h1>
      <p className="mt-2 text-sm text-slate-700">
        Discover the latest <strong>welcome bonuses</strong>, <strong>promo codes</strong>, and{" "}
        <strong>special offers</strong> from top sportsbooks and casinos. Community-ranked and
        regularly updated.
      </p>
    </header>
  );
}
