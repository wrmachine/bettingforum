import { SectionList } from "@/components/SectionList";
import { HomeLeftSidebar } from "@/components/HomeLeftSidebar";
import { HomePageHero } from "@/components/HomePageHero";
import { MobileSidebarDrawer } from "@/components/MobileSidebarDrawer";
import { getPopularPosts, getLatestArticle, getLatestPosts } from "@/lib/posts";
import { getForumsWithOverrides } from "@/lib/forums";

export default async function HomePage() {
  const [popularPosts, latestArticle, latestPosts, forums] = await Promise.all([
    getPopularPosts(4),
    getLatestArticle(),
    getLatestPosts(25),
    getForumsWithOverrides(),
  ]);

  return (
    <div className="flex flex-col gap-8" data-section="home">
      <HomePageHero />
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-8">
        <MobileSidebarDrawer>
          <HomeLeftSidebar forums={forums} />
        </MobileSidebarDrawer>
        <div className="min-w-0 flex-1 space-y-10">
          <SectionList
            popularPosts={popularPosts}
            latestArticle={latestArticle}
            latestPosts={latestPosts}
          />
        </div>
      </div>
    </div>
  );
}
