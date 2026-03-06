import { ForumSidebar } from "@/components/ForumSidebar";
import { getForumsWithOverrides } from "@/lib/forums";

export default async function ThreadsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const forums = await getForumsWithOverrides();
  return (
    <div className="flex gap-8">
      <ForumSidebar forums={forums} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
