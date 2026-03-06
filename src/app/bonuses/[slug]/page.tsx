import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BonusDetail } from "@/components/BonusDetail";
import { buildMetadata, buildBreadcrumbSchema, buildOfferSchema, getSchemaEnabled } from "@/lib/seo";
import { getBaseUrl } from "@/lib/base-url";
import { SchemaJsonLd } from "@/components/SchemaJsonLd";

async function getBonus(slug: string) {
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
  const post = await getBonus(slug);
  if (!post || post.type !== "bonus") return {};
  const path = `/bonuses/${slug}`;
  const meta = await buildMetadata(path, {
    title: post.title,
    description: post.excerpt ?? post.title,
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

export default async function BonusPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBonus(slug);

  if (!post || post.type !== "bonus") notFound();

  const base = await getBaseUrl();
  const schemas = [];
  const [offerEnabled, breadcrumbEnabled] = await Promise.all([
    getSchemaEnabled("offer"),
    getSchemaEnabled("breadcrumb"),
  ]);
  if (offerEnabled)
    schemas.push(
      buildOfferSchema({
        ...post,
        offerValue: post.bonus?.offerValue ?? null,
        promoCode: post.bonus?.promoCode ?? null,
        terms: post.bonus?.terms ?? null,
        claimUrl: post.bonus?.claimUrl ?? null,
        expiresAt: post.bonus?.expiresAt ?? null,
        product: post.bonus?.product ?? null,
        createdAt: post.createdAt,
      })
    );
  if (breadcrumbEnabled) {
    schemas.push(
      buildBreadcrumbSchema([
        { name: "Home", url: base },
        { name: "Bonuses", url: `${base}/bonuses` },
        { name: post.title, url: `${base}/bonuses/${post.slug}` },
      ])
    );
  }

  return (
    <>
      {schemas.length > 0 && <SchemaJsonLd data={schemas} />}
      <BonusDetail post={post} />
    </>
  );
}
