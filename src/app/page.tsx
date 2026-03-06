import { SectionList } from "@/components/SectionList";
import { HomeLeftSidebar } from "@/components/HomeLeftSidebar";
import { HomePageHero } from "@/components/HomePageHero";
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
      <div className="flex flex-col gap-8 lg:flex-row">
        <HomeLeftSidebar forums={forums} />
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
