import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-12rem)] gap-8">
      <aside className="w-56 shrink-0 border-r border-slate-200 pr-6">
        <nav className="space-y-6">
          <div>
            <Link
              href="/admin"
              className="block rounded px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/profile"
              className="block rounded px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Profile
            </Link>
          </div>
          <div>
            <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Content</p>
            <Link
              href="/admin/posts"
              className="block rounded px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Posts
            </Link>
            <Link
              href="/admin/pages"
              className="block rounded px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Pages
            </Link>
            <Link
              href="/admin/menus"
              className="block rounded px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Menus
            </Link>
            <Link
              href="/admin/forums"
              className="block rounded px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Forums
            </Link>
          </div>
          <div>
            <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Site</p>
            <Link
              href="/admin/seo"
              className="block rounded px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              SEO
            </Link>
            <Link
              href="/admin/seo/settings"
              className="block rounded px-3 py-2 pl-6 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              Global Settings
            </Link>
            <Link
              href="/admin/seo/meta"
              className="block rounded px-3 py-2 pl-6 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              Page Meta
            </Link>
            <Link
              href="/admin/seo/sitemap"
              className="block rounded px-3 py-2 pl-6 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              Sitemap
            </Link>
            <Link
              href="/admin/seo/schema"
              className="block rounded px-3 py-2 pl-6 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              Schema
            </Link>
            <Link
              href="/admin/redirects"
              className="block rounded px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              301 Redirects
            </Link>
            <Link
              href="/admin/ads"
              className="block rounded px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Ads
            </Link>
            <Link
              href="/admin/users"
              className="block rounded px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Users
            </Link>
          </div>
          <div>
            <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Tools</p>
            <Link
              href="/admin/bonus-discovery"
              className="block rounded px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Bonus Discovery
            </Link>
            <Link
              href="/admin/control-panel"
              className="block rounded px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Control Panel
            </Link>
            <Link
              href="/admin/api"
              className="block rounded px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              APIs
            </Link>
            <Link
              href="/admin/claude"
              className="block rounded px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Claude AI
            </Link>
            <Link
              href="/admin/ai-bots"
              className="block rounded px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              AI Bots
            </Link>
            <Link
              href="/admin/ai-bots/new"
              className="block rounded px-3 py-2 pl-6 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              New Bot
            </Link>
            <Link
              href="/admin/ai-bots/activity"
              className="block rounded px-3 py-2 pl-6 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              Activity
            </Link>
          </div>
        </nav>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
