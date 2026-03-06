import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListicleDetail } from "@/components/ListicleDetail";
import { buildMetadata, buildArticleSchema, buildItemListSchema, buildBreadcrumbSchema, getSchemaEnabled } from "@/lib/seo";
import { getBaseUrl } from "@/lib/base-url";
import { SchemaJsonLd } from "@/components/SchemaJsonLd";

export const dynamic = "force-dynamic";

async function getListicle(slug: string) {
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
  const post = await getListicle(slug);
  if (!post || post.type !== "listicle") return {};
  const path = `/listicles/${slug}`;
  const meta = await buildMetadata(path, {
    title: post.title,
    description: post.excerpt ?? post.listicle?.intro ?? post.title,
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

export default async function ListiclePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getListicle(slug);

  if (!post || post.type !== "listicle") notFound();

  const base = await getBaseUrl();
  const schemas = [];
  const [articleEnabled, listicleEnabled, breadcrumbEnabled] = await Promise.all([
    getSchemaEnabled("article"),
    getSchemaEnabled("listicle"),
    getSchemaEnabled("breadcrumb"),
  ]);
  if (articleEnabled) schemas.push(buildArticleSchema({ ...post, createdAt: post.createdAt }));
  if (breadcrumbEnabled) {
    schemas.push(
      buildBreadcrumbSchema([
        { name: "Home", url: base },
        { name: "Best Of", url: `${base}/listicles` },
        { name: post.title, url: `${base}/listicles/${post.slug}` },
      ])
    );
  }
  if (listicleEnabled && post.listicle?.items?.length) {
    schemas.push(
      buildItemListSchema(
        post.listicle.items.map((item: { product: { post?: { title?: string; slug?: string }; brandName?: string }; position: number }) => ({
          name: item.product?.post?.title ?? item.product?.brandName ?? `Item ${item.position}`,
          url: `${base}/products/${item.product?.post?.slug ?? ""}`,
        })),
        post.title
      )
    );
  }

  return (
    <>
      {schemas.length > 0 && <SchemaJsonLd data={schemas} />}
      <ListicleDetail post={post} />
    </>
  );
}
