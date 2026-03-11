import type { Metadata } from "next";
import { ProductsLayoutContent } from "@/components/ProductsLayoutContent";
import { ProductsPageHeader } from "@/components/ProductsPageHeader";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const meta = await buildMetadata("/products", {
      title: "Sportsbooks, Casinos & Betting Products – Betting Forum",
      description:
        "Browse and compare sportsbooks, online casinos, crypto betting sites, and betting tools. Community reviews and rankings.",
      keywords: ["sportsbooks", "casinos", "betting sites", "crypto betting", "sports betting reviews"],
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
      title: "Products – Betting Forum",
      description: "Browse sportsbooks, casinos, and betting tools ranked by the community.",
    };
  }
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-section="products">
      <ProductsLayoutContent header={<ProductsPageHeader />}>
        {children}
      </ProductsLayoutContent>
    </div>
  );
}
