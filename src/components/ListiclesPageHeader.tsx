"use client";

import { usePathname } from "next/navigation";

/** Renders the page header only on the listicles index, not on listicle detail pages. */
export function ListiclesPageHeader() {
  const pathname = usePathname();
  const isIndex = pathname === "/listicles" || pathname === "/listicles/";

  if (!isIndex) return null;

  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold uppercase tracking-tight text-black sm:text-3xl">
        Best Of
      </h1>
      <p className="mt-2 text-sm text-slate-700">
        Community-curated lists of the top{" "}
        <strong>betting products</strong> and{" "}
        <strong>sportsbooks</strong>, ranked and reviewed to help you find the
        best options for your needs.
      </p>
    </header>
  );
}
