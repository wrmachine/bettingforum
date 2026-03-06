"use client";

import { usePathname } from "next/navigation";
import { PageHeader } from "./PageHeader";

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function BonusesPageHeader() {
  const pathname = usePathname();
  const isIndex = pathname === "/bonuses" || pathname === "/bonuses/";

  if (!isIndex) return null;

  return (
    <PageHeader
      title="Best Betting Bonuses"
      author="Betting Forum"
      authorUrl="/"
      role="Bonus Offers"
      date={formatDate()}
      factChecked
      intro={
        <>
          Discover the latest <strong>welcome bonuses</strong>, <strong>promo codes</strong>, and{" "}
          <strong>special offers</strong> from top sportsbooks and casinos. Community-ranked and
          regularly updated.
        </>
      }
    />
  );
}
