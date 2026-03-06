import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleDetail } from "@/components/ArticleDetail";
import {
  buildMetadata,
  buildArticleSchema,
  buildBreadcrumbSchema,
  getSchemaEnabled,
} from "@/lib/seo";
import { getBaseUrl } from "@/lib/base-url";
import { SchemaJsonLd } from "@/components/SchemaJsonLd";
import { extractShortcodeRefs } from "@/lib/shortcodes";
import { resolveShortcodes } from "@/lib/shortcode-resolve";

async function getArticle(slug: string) {
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
  try {
    const { slug } = await params;
    const post = await getArticle(slug);
    if (!post || post.type !== "article") return {};
    const lead = post.article?.lead ?? post.excerpt ?? post.title;
    const path = `/articles/${slug}`;
    const meta = await buildMetadata(path, {
      title: post.title,
      description: lead,
      articleAuthor: post.author?.username,
      articlePublishedTime: post.createdAt,
      ogImage: post.article?.featuredImageUrl,
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
  } catch {
    return { title: "Article – Betting Forum" };
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getArticle(slug);

  if (!post || post.type !== "article") notFound();

  const refs = post.body ? extractShortcodeRefs(post.body) : [];
  const shortcodeData = refs.length > 0 ? await resolveShortcodes(refs) : null;

  const base = await getBaseUrl();
  const schemas = [];
  const [articleEnabled, breadcrumbEnabled] = await Promise.all([
    getSchemaEnabled("article"),
    getSchemaEnabled("breadcrumb"),
  ]);
  if (articleEnabled)
    schemas.push(buildArticleSchema({ ...post, createdAt: post.createdAt }));
  if (breadcrumbEnabled) {
    schemas.push(
      buildBreadcrumbSchema([
        { name: "Home", url: base },
        { name: "Articles", url: `${base}/articles` },
        { name: post.title, url: `${base}/articles/${post.slug}` },
      ])
    );
  }

  return (
    <>
      {schemas.length > 0 && <SchemaJsonLd data={schemas} />}
      <ArticleDetail post={post} shortcodeData={shortcodeData} />
    </>
  );
}
