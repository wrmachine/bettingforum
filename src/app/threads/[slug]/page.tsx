import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ThreadDetail } from "@/components/ThreadDetail";
import { buildMetadata, buildDiscussionForumPostingSchema, buildBreadcrumbSchema, getSchemaEnabled } from "@/lib/seo";
import { getBaseUrl } from "@/lib/base-url";
import { SchemaJsonLd } from "@/components/SchemaJsonLd";
import { getPostBySlug } from "@/lib/post-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    if (!post || post.type !== "thread") return {};
    const path = `/threads/${slug}`;
    const meta = await buildMetadata(path, {
      title: post.title,
      description: post.excerpt ?? post.body?.slice(0, 160) ?? post.title,
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
  } catch {
    return { title: "Discussion – Betting Forum" };
  }
}

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || post.type !== "thread") notFound();

  const schemas: unknown[] = [];
  try {
    const base = await getBaseUrl();
    const [forumPostEnabled, breadcrumbEnabled] = await Promise.all([
      getSchemaEnabled("discussionForumPosting"),
      getSchemaEnabled("breadcrumb"),
    ]);
    if (forumPostEnabled) schemas.push(buildDiscussionForumPostingSchema({ ...post, createdAt: post.createdAt }));
    if (breadcrumbEnabled) {
      schemas.push(
        buildBreadcrumbSchema([
          { name: "Home", url: base },
          { name: "Threads", url: `${base}/threads` },
          { name: post.title, url: `${base}/threads/${post.slug}` },
        ])
      );
    }
  } catch (err) {
    console.error("ThreadPage schema error:", err);
  }

  return (
    <>
      {schemas.length > 0 && <SchemaJsonLd data={schemas} />}
      <ThreadDetail post={post} />
    </>
  );
}
