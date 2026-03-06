import { MetadataRoute } from "next";
import { getGlobalSeoSettings } from "@/lib/seo";
import { BASE_URL } from "@/lib/seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getGlobalSeoSettings();

  return {
    rules: [
      {
        userAgent: "*",
        allow: settings.robotsAllow ? "/" : undefined,
        disallow: settings.robotsDisallowPaths,
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
