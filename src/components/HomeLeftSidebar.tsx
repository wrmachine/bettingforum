import { ForumSidebar } from "./ForumSidebar";
import { AccountWidget } from "./AccountWidget";
import type { ForumConfig } from "@/lib/forums";

export function HomeLeftSidebar({ forums }: { forums?: ForumConfig[] }) {
  return (
    <aside className="flex w-48 shrink-0 flex-col gap-6">
      <ForumSidebar forums={forums} />
      <AccountWidget />
    </aside>
  );
}
