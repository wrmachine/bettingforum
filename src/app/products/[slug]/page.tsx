import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
import { buildMetadata, buildProductSchema, buildBreadcrumbSchema, getSchemaEnabled } from "@/lib/seo";
import { getBaseUrl } from "@/lib/base-url";
import { SchemaJsonLd } from "@/components/SchemaJsonLd";

async function getProduct(slug: string) {
  try {
    const base = await getBaseUrl();
    const res = await fetch(`${base}/api/posts/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    const text = await res.text();
    if (text.startsWith("<")) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getProduct(slug);
  if (!post || post.type !== "product") return {};
  const path = `/products/${slug}`;
  const meta = await buildMetadata(path, {
    title: post.title,
    description: post.excerpt ?? post.title,
    ogImage: post.product?.logoUrl,
    articleAuthor: post.author?.username,
    articlePublishedTime: post.createdAt,
  });
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: meta.openGraph,
    twitter: meta.twitter,
    robots: meta.robots,
    alternates: meta.alternates,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let post;
  try {
    post = await getProduct(slug);
  } catch (err) {
    console.error("ProductPage getProduct error:", err);
    notFound();
  }

  if (!post || post.type !== "product") notFound();

  if (!post.product) {
    console.error("ProductPage: post.type is product but post.product is null", { slug });
    notFound();
  }

  const schemas: unknown[] = [];
  try {
    const base = await getBaseUrl();
    const [productEnabled, breadcrumbEnabled] = await Promise.all([
      getSchemaEnabled("product"),
      getSchemaEnabled("breadcrumb"),
    ]);
    if (productEnabled) schemas.push(buildProductSchema(post));
    if (breadcrumbEnabled) {
      schemas.push(
        buildBreadcrumbSchema([
          { name: "Home", url: base },
          { name: "Products", url: `${base}/products` },
          { name: post.title, url: `${base}/products/${post.slug}` },
        ])
      );
    }
  } catch (err) {
    console.error("ProductPage schema/metadata error:", err);
  }

  return (
    <>
      {schemas.length > 0 && <SchemaJsonLd data={schemas} />}
      <ProductDetail post={post} />
    </>
  );
}
