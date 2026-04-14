import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { BASE_URL } from "@/lib/seo";
import { FORUM_CONFIGS } from "@/lib/forums";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = BASE_URL;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1 },
    { url: `${base}/products`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.95 },
    { url: `${base}/forums`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${base}/articles`, lastModified: new Date(), changeFrequency: "hourly" as const, priority: 0.95 },
    { url: `${base}/bonuses`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${base}/threads`, lastModified: new Date(), changeFrequency: "hourly" as const, priority: 0.9 },
    { url: `${base}/listicles`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.85 },
    { url: `${base}/categories`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${base}/responsible`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  const forumRoutes: MetadataRoute.Sitemap = FORUM_CONFIGS.map((forum) => ({
    url: `${base}/f/${forum.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: forum.category === "product" ? 0.9 : 0.85,
  }));

  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.post.findMany({
      where: { status: "published" },
      select: { slug: true, type: true, createdAt: true },
    });

    const typeToPath: Record<string, string> = {
      product: "products",
      thread: "threads",
      listicle: "listicles",
      article: "articles",
      bonus: "bonuses",
    };

    dynamicRoutes = posts
      .filter((p) => typeToPath[p.type])
      .map((p) => ({
        url: `${base}/${typeToPath[p.type]}/${p.slug}`,
        lastModified: p.createdAt ?? new Date(),
        changeFrequency: p.type === "article" ? ("daily" as const) : ("weekly" as const),
        priority: p.type === "product" || p.type === "article" ? 0.9 : 0.8,
      }));
  } catch {
    // DB unavailable — return static routes only
  }

  return [...staticRoutes, ...forumRoutes, ...dynamicRoutes];
}
