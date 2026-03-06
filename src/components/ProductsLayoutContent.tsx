"use client";

import { usePathname } from "next/navigation";
import { HomeSidebar } from "./HomeSidebar";

/** Renders the products layout: sidebar only on index, full-width on detail pages. */
export function ProductsLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isIndex = pathname === "/products" || pathname === "/products/";

  if (!isIndex) {
    return <div className="mt-8">{children}</div>;
  }

  return (
    <div className="mt-8 flex flex-col gap-8 lg:flex-row">
      <div className="min-w-0 flex-1">{children}</div>
      <HomeSidebar />
    </div>
  );
}
