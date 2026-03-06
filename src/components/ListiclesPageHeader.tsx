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

/** Renders the page header only on the listicles index, not on listicle detail pages. */
export function ListiclesPageHeader() {
  const pathname = usePathname();
  const isIndex = pathname === "/listicles" || pathname === "/listicles/";

  if (!isIndex) return null;

  return (
    <PageHeader
      title="Best Of"
      author="Betting Forum"
      authorUrl="/"
      role="Curated Lists"
      date={formatDate()}
      factChecked
      intro={
        <>
          Community-curated lists of the top{" "}
          <strong>betting products</strong> and{" "}
          <strong>sportsbooks</strong>, ranked and reviewed to help you find the
          best options for your needs.
        </>
      }
    />
  );
}
