import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { StaticPageLayout } from "@/components/StaticPageLayout";

const SLUG_BLOCKLIST = [
  "contact",
  "admin",
  "auth",
  "api",
  "u",
  "products",
  "threads",
  "articles",
  "listicles",
  "account",
  "submit",
  "responsible",
  "categories",
  "search",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
];

async function getStaticPage(slug: string) {
  if (SLUG_BLOCKLIST.includes(slug)) return null;
  return prisma.staticPage.findUnique({
    where: { slug },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getStaticPage(slug);
  if (!page) return {};

  const path = `/${slug}`;
  const meta = await buildMetadata(path, {
    title: page.title,
    description: page.body.slice(0, 160).replace(/\n/g, " "),
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

export default async function StaticPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getStaticPage(slug);

  if (!page) notFound();

  return (
    <StaticPageLayout
      title={page.title}
      body={page.body}
      updatedAt={page.updatedAt}
    />
  );
}
