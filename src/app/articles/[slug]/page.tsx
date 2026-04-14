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
import { getPostBySlug } from "@/lib/post-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
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
  const post = await getPostBySlug(slug);

  if (!post || post.type !== "article") notFound();

  const refs = post.body ? extractShortcodeRefs(post.body) : [];
  const shortcodeData = refs.length > 0 ? await resolveShortcodes(refs) : null;

  const schemas: unknown[] = [];
  try {
    const base = await getBaseUrl();
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
  } catch (err) {
    console.error("ArticlePage schema error:", err);
  }

  return (
    <>
      {schemas.length > 0 && <SchemaJsonLd data={schemas} />}
      <ArticleDetail post={post} shortcodeData={shortcodeData} />
    </>
  );
}
