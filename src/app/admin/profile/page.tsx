import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { getUserProfileByUsername } from "@/lib/user-profile";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Admin Control Center – Betting Forum",
  robots: { index: false, follow: false },
};

const SectionCard = ({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) => (
  <Link href={href}>
    <div className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-felt/10 group-hover:text-felt">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 group-hover:text-felt">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <svg
          className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-felt"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  </Link>
);

export default async function AdminProfilePage() {
  const result = await requireAdmin();
  if (result.error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        {result.error}
      </div>
    );
  }

  const { session } = result;
  const username = session?.user?.name ?? session?.user?.email?.split("@")[0] ?? "admin";
  const [profile, postCount, userCount] = await Promise.all([
    getUserProfileByUsername(username),
    prisma.post.count(),
    prisma.user.count(),
  ]);

  return (
    <div className="space-y-10">
      {/* Admin identity & overview */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="h-20 bg-gradient-to-r from-amber-500/20 via-felt/20 to-felt-light/20" />
        <div className="relative px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-white bg-amber-100 text-3xl font-bold text-amber-800 shadow-lg">
                {profile?.username?.charAt(0).toUpperCase() ?? "A"}
              </div>
              <div className="pb-1">
                <h1 className="text-2xl font-bold text-slate-900">
                  {profile?.username ?? username}
                </h1>
                <p className="mt-0.5 flex items-center gap-2">
                  <span className="rounded-full border border-amber-300 bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                    Admin
                  </span>
                  <span className="text-sm text-slate-500">Full site control</span>
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="rounded-lg bg-slate-50 px-4 py-2 text-center">
                <p className="text-2xl font-bold text-slate-900">{postCount}</p>
                <p className="text-xs text-slate-500">Total posts</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-4 py-2 text-center">
                <p className="text-2xl font-bold text-slate-900">{userCount}</p>
                <p className="text-xs text-slate-500">Users</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thread & Content Management */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Thread & Content Management</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SectionCard
            href="/admin/posts"
            title="Posts & Threads"
            description="Manage all posts, threads, products, listicles, and articles. Publish, unpublish, promote, or delete."
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            }
          />
          <SectionCard
            href="/admin/posts?type=thread"
            title="Forum Threads"
            description="Moderate discussion threads. Pin, lock, or remove threads."
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            }
          />
          <SectionCard
            href="/admin/posts?type=product"
            title="Products"
            description="Manage sportsbooks, casinos, and product listings."
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            }
          />
        </div>
      </section>

      {/* SEO Tools */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">SEO Tools</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SectionCard
            href="/admin/seo"
            title="SEO Center"
            description="Central hub for all SEO settings and tools."
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
          />
          <SectionCard
            href="/admin/seo/settings"
            title="Global Settings"
            description="Site name, default meta, robots, Open Graph."
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            }
          />
          <SectionCard
            href="/admin/seo/meta"
            title="Page Meta"
            description="Per-page title, description, noindex overrides."
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            }
          />
          <SectionCard
            href="/admin/seo/sitemap"
            title="Sitemap"
            description="Configure sitemap priorities and change frequencies."
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            }
          />
        </div>
      </section>

      {/* Monetization */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Monetization</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SectionCard
            href="/admin/ads"
            title="Ads"
            description="Ad spaces, rotation, impressions & click tracking."
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                />
              </svg>
            }
          />
        </div>
      </section>

      {/* User Management */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">User Management</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <SectionCard
            href="/admin/users"
            title="Users"
            description="View all users, change roles (admin/user), suspend accounts."
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            }
          />
          <SectionCard
            href={`/u/${profile?.username ?? username}`}
            title="Your Public Profile"
            description="View your public profile as members see it."
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            }
          />
        </div>
      </section>

      {/* Control Panel */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Control Panel</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <SectionCard
            href="/admin/control-panel"
            title="Control Panel"
            description="AI content prompts, system status, and admin preferences."
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            }
          />
        </div>
      </section>

      {/* APIs */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">APIs & Integrations</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <SectionCard
            href="/admin/api"
            title="API Management"
            description="API keys, webhooks, rate limits, and API documentation."
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
            }
          />
        </div>
      </section>

      {/* AI & Moderation */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">AI & Moderation</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <SectionCard
            href="/admin/claude"
            title="Claude AI"
            description="Use Claude for content generation, moderation, and assistance."
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            }
          />
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 opacity-75">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-500">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-700">Reports & Moderation</h3>
                <p className="mt-1 text-sm text-slate-500">User reports, flagged content. Coming in v2.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Site & Account */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Site & Account</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/account">
            <div className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-felt/10 group-hover:text-felt">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-felt">Account Settings</h3>
                  <p className="mt-1 text-sm text-slate-500">Manage your profile and preferences.</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
