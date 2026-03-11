"use client";

import { usePathname } from "next/navigation";

/** Renders the page header only on the products index, not on product detail pages. */
export function ProductsPageHeader() {
  const pathname = usePathname();
  const isIndex = pathname === "/products" || pathname === "/products/";

  if (!isIndex) return null;

  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold uppercase tracking-tight text-black sm:text-3xl">
        Best Betting Products
      </h1>
      <p className="mt-2 text-sm text-slate-700">
        Our community has ranked the top{" "}
        <strong>sportsbooks</strong>, <strong>casinos</strong>, and{" "}
        <strong>betting tools</strong> to help you find the best bonuses,
        banking options, and features for your needs.
      </p>
    </header>
  );
}
