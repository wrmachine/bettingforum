import { ForumSidebar } from "@/components/ForumSidebar";
import { ListiclesPageHeader } from "@/components/ListiclesPageHeader";
import { ListicleDetailHeader } from "@/components/ListicleDetailHeader";
import { getForumsWithOverrides } from "@/lib/forums";

export default async function ListiclesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const forums = await getForumsWithOverrides();
  return (
    <div className="flex flex-col" data-section="listicles">
      <ListiclesPageHeader />
      <ListicleDetailHeader />
      <div className="mt-8 flex gap-8">
        <ForumSidebar forums={forums} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
