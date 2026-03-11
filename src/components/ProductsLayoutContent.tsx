"use client";

import { usePathname } from "next/navigation";
import { HomeSidebar } from "./HomeSidebar";

/** Renders the products layout: sidebar only on index, full-width on detail pages. */
export function ProductsLayoutContent({
  children,
  header,
}: {
  children: React.ReactNode;
  header?: React.ReactNode;
}) {
  const pathname = usePathname();
  const isIndex = pathname === "/products" || pathname === "/products/";

  if (!isIndex) {
    return <div className="pt-[50px]">{children}</div>;
  }

  return (
    <div className="flex flex-col gap-8 pt-[50px] lg:flex-row">
      <div className="min-w-0 flex-1">
        {header}
        {children}
      </div>
      <HomeSidebar />
    </div>
  );
}
