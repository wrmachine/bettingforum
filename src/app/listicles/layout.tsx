import { ForumSidebar } from "@/components/ForumSidebar";
import { ListiclesPageHeader } from "@/components/ListiclesPageHeader";
import { ListicleDetailHeader } from "@/components/ListicleDetailHeader";
import { MobileSidebarDrawer } from "@/components/MobileSidebarDrawer";
import { getForumsWithOverrides } from "@/lib/forums";

export default async function ListiclesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const forums = await getForumsWithOverrides();
  return (
    <div className="flex gap-8 pt-[50px]" data-section="listicles">
      <MobileSidebarDrawer>
        <ForumSidebar forums={forums} />
      </MobileSidebarDrawer>
      <div className="min-w-0 flex-1">
        <ListiclesPageHeader />
        <ListicleDetailHeader />
        {children}
      </div>
    </div>
  );
}
