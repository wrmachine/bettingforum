import type { Metadata } from "next";
import { ForumSidebar } from "@/components/ForumSidebar";
import { MobileSidebarDrawer } from "@/components/MobileSidebarDrawer";
import { buildMetadata } from "@/lib/seo";
import { getForumsWithOverrides } from "@/lib/forums";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const meta = await buildMetadata("/articles", {
      title: "Articles – Betting Forum",
      description:
        "In-depth articles and community discussions on sports betting and online gambling. Expert insights and trending conversations.",
    });
    return {
      title: meta.title,
      description: meta.description,
      keywords: meta.keywords,
      openGraph: meta.openGraph,
      twitter: meta.twitter,
      alternates: meta.alternates,
    };
  } catch {
    return {
      title: "Articles – Betting Forum",
      description: "In-depth articles and community discussions on sports betting and online gambling.",
    };
  }
}

export default async function ArticlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const forums = await getForumsWithOverrides();
  return (
    <div className="flex gap-8 pt-[50px]">
      <MobileSidebarDrawer>
        <ForumSidebar forums={forums} />
      </MobileSidebarDrawer>
      <div className="min-w-0 flex-1">
        {children}
      </div>
    </div>
  );
}
