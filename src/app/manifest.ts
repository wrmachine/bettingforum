import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Betting Forum",
    short_name: "Betting Forum",
    description: "The Reddit of sports betting. Discuss strategies, share tips, and discover the best sportsbooks and casinos.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#166534",
    orientation: "portrait-primary",
    scope: "/",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
        purpose: "any",
      },
    ],
    categories: ["sports", "entertainment", "social"],
    lang: "en-US",
  };
}
