import Link from "next/link";

export default function AdminSeoPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">SEO Center</h1>
      <p className="mt-2 text-slate-600">
        Manage sitemaps, schema markup, meta tags, and search visibility.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/seo/settings">
          <div className="rounded-lg border border-slate-200 bg-white p-6 transition hover:border-emerald-500 hover:shadow-md">
            <h2 className="font-semibold text-gray-900">Global Settings</h2>
            <p className="mt-1 text-sm text-gray-500">
              Site name, default meta, robots, Open Graph defaults
            </p>
          </div>
        </Link>
        <Link href="/admin/seo/meta">
          <div className="rounded-lg border border-slate-200 bg-white p-6 transition hover:border-emerald-500 hover:shadow-md">
            <h2 className="font-semibold text-gray-900">Page Meta</h2>
            <p className="mt-1 text-sm text-gray-500">
              Per-page title, description, noindex, canonical overrides
            </p>
          </div>
        </Link>
        <Link href="/admin/seo/sitemap">
          <div className="rounded-lg border border-slate-200 bg-white p-6 transition hover:border-emerald-500 hover:shadow-md">
            <h2 className="font-semibold text-gray-900">Sitemap</h2>
            <p className="mt-1 text-sm text-gray-500">
              Configure sitemap priorities and change frequencies
            </p>
          </div>
        </Link>
        <Link href="/admin/seo/schema">
          <div className="rounded-lg border border-slate-200 bg-white p-6 transition hover:border-emerald-500 hover:shadow-md">
            <h2 className="font-semibold text-gray-900">Schema</h2>
            <p className="mt-1 text-sm text-gray-500">
              JSON-LD structured data: Organization, Product, Article
            </p>
          </div>
        </Link>
        <Link href="/admin/seo/indexing">
          <div className="rounded-lg border border-slate-200 bg-white p-6 transition hover:border-emerald-500 hover:shadow-md">
            <h2 className="font-semibold text-gray-900">Rapid Indexer</h2>
            <p className="mt-1 text-sm text-gray-500">
              Submit URLs to Google for fast indexing via Rapid Indexer
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
