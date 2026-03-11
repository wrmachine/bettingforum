import { ForumSidebar } from "@/components/ForumSidebar";
import { BonusesPageHeader } from "@/components/BonusesPageHeader";
import { MobileSidebarDrawer } from "@/components/MobileSidebarDrawer";
import { getForumsWithOverrides } from "@/lib/forums";

export default async function BonusesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const forums = await getForumsWithOverrides();
  return (
    <div className="flex gap-8 pt-[50px]" data-section="bonuses">
      <MobileSidebarDrawer>
        <ForumSidebar forums={forums} />
      </MobileSidebarDrawer>
      <div className="min-w-0 flex-1">
        <BonusesPageHeader />
        {children}
      </div>
    </div>
  );
}
