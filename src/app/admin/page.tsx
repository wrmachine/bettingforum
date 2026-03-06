import Link from "next/link";

export const metadata = {
  title: "Admin – Betting Forum",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
      <p className="mt-2 text-slate-600">
        Quick access to admin tools. Use the sidebar or the control center for full access.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/admin/posts/new/article"
          className="rounded-lg bg-felt px-4 py-2 text-sm font-medium text-white hover:bg-felt/90"
        >
          + Article
        </Link>
        <Link
          href="/admin/posts/new/product"
          className="rounded-lg bg-felt px-4 py-2 text-sm font-medium text-white hover:bg-felt/90"
        >
          + Product
        </Link>
        <Link
          href="/admin/posts/new/listicle"
          className="rounded-lg bg-felt px-4 py-2 text-sm font-medium text-white hover:bg-felt/90"
        >
          + Listicle
        </Link>
        <Link
          href="/admin/posts/new/bonus"
          className="rounded-lg bg-felt px-4 py-2 text-sm font-medium text-white hover:bg-felt/90"
        >
          + Bonus
        </Link>
      </div>

      <Link
        href="/admin/profile"
        className="mt-8 block rounded-xl border-2 border-felt bg-felt/5 p-8 transition hover:border-felt hover:bg-felt/10"
      >
        <h2 className="text-xl font-semibold text-slate-900">Admin Control Center →</h2>
        <p className="mt-2 text-slate-600">
          Full site control: threads, SEO, users, APIs, AI tools, and more.
        </p>
      </Link>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/posts">
          <div className="rounded-lg border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-sm">
            <h2 className="font-semibold text-gray-900">Posts</h2>
            <p className="mt-1 text-sm text-gray-500">Manage all posts & threads</p>
          </div>
        </Link>
        <Link href="/admin/users">
          <div className="rounded-lg border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-sm">
            <h2 className="font-semibold text-gray-900">Users</h2>
            <p className="mt-1 text-sm text-gray-500">User management</p>
          </div>
        </Link>
        <Link href="/admin/seo">
          <div className="rounded-lg border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-sm">
            <h2 className="font-semibold text-gray-900">SEO</h2>
            <p className="mt-1 text-sm text-gray-500">SEO tools & settings</p>
          </div>
        </Link>
        <Link href="/admin/api">
          <div className="rounded-lg border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-sm">
            <h2 className="font-semibold text-gray-900">APIs</h2>
            <p className="mt-1 text-sm text-gray-500">API management & docs</p>
          </div>
        </Link>
        <Link href="/admin/claude">
          <div className="rounded-lg border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-sm">
            <h2 className="font-semibold text-gray-900">Claude AI</h2>
            <p className="mt-1 text-sm text-gray-500">AI content & moderation</p>
          </div>
        </Link>
        <Link href="/admin/control-panel">
          <div className="rounded-lg border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-sm">
            <h2 className="font-semibold text-gray-900">Control Panel</h2>
            <p className="mt-1 text-sm text-gray-500">AI prompts & system settings</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
