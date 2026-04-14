import { ForumSidebar } from "@/components/ForumSidebar";
import { MobileSidebarDrawer } from "@/components/MobileSidebarDrawer";
import { getForumsWithOverrides } from "@/lib/forums";

export default async function ForumLayout({ children }: { children: React.ReactNode }) {
  const forums = await getForumsWithOverrides();
  return (
    <div className="flex gap-8 pt-[50px]" data-forum-route>
      <MobileSidebarDrawer>
        <ForumSidebar forums={forums} />
      </MobileSidebarDrawer>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
