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

/** Renders the page header only on the products index, not on product detail pages. */
export function ProductsPageHeader() {
  const pathname = usePathname();
  const isIndex = pathname === "/products" || pathname === "/products/";

  if (!isIndex) return null;

  return (
    <PageHeader
      title="Best Betting Products"
      author="Betting Forum"
      authorUrl="/"
      role="Product Reviews"
      date={formatDate()}
      factChecked
      intro={
        <>
          Our community has ranked the top{" "}
          <strong>sportsbooks</strong>, <strong>casinos</strong>, and{" "}
          <strong>betting tools</strong> to help you find the best bonuses,
          banking options, and features for your needs.
        </>
      }
    />
  );
}
