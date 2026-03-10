import { ForumSidebar } from "@/components/ForumSidebar";
import { MobileSidebarDrawer } from "@/components/MobileSidebarDrawer";
import { getForumsWithOverrides } from "@/lib/forums";

export default async function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const forums = await getForumsWithOverrides();
  return (
    <div className="flex gap-8">
      <MobileSidebarDrawer>
        <ForumSidebar forums={forums} />
      </MobileSidebarDrawer>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
