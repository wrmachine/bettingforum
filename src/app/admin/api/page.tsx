import { requireAdmin } from "@/lib/admin";

export const metadata = {
  title: "API Management – Admin",
  robots: { index: false, follow: false },
};

const apiEndpoints = [
  { method: "GET", path: "/api/posts", description: "List posts with filters (type, sort, timeRange)" },
  { method: "POST", path: "/api/posts", description: "Create a new post (auth required)" },
  { method: "GET", path: "/api/posts/[slug]", description: "Get single post by slug" },
  { method: "PATCH", path: "/api/posts/[slug]", description: "Update post (auth required)" },
  { method: "GET", path: "/api/listicles", description: "List listicles" },
  { method: "POST", path: "/api/listicles", description: "Create listicle (auth required)" },
  { method: "GET", path: "/api/products/[id]/reviews", description: "Get product reviews" },
  { method: "POST", path: "/api/products/[id]/reviews", description: "Add review (auth required)" },
  { method: "POST", path: "/api/posts/[slug]/vote", description: "Vote on post (auth required)" },
  { method: "POST", path: "/api/posts/[slug]/comments", description: "Add comment (auth required)" },
];

export default async function AdminApiPage() {
  const result = await requireAdmin();
  if (result.error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        {result.error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">API Management</h1>
      <p className="mt-2 text-slate-600">
        API documentation, keys, and integration settings.
      </p>

      {/* API Keys placeholder */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">API Keys</h2>
        <p className="mt-2 text-sm text-slate-600">
          API key management for third-party integrations. Coming soon.
        </p>
        <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
          Currently, APIs use session-based auth (NextAuth). For programmatic access, consider adding API key support.
        </div>
      </div>

      {/* Public API endpoints */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Available Endpoints</h2>
        <p className="mt-2 text-sm text-slate-600">
          Documented API routes. Auth-required endpoints need a valid session cookie.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-slate-500">
                  Method
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-slate-500">
                  Path
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-slate-500">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {apiEndpoints.map((ep) => (
                <tr key={`${ep.method}-${ep.path}`}>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-mono font-medium ${
                        ep.method === "GET"
                          ? "bg-blue-100 text-blue-800"
                          : ep.method === "POST"
                          ? "bg-green-100 text-green-800"
                          : ep.method === "PATCH"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {ep.method}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-slate-700">{ep.path}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{ep.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Webhooks placeholder */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Webhooks</h2>
        <p className="mt-2 text-sm text-slate-600">
          Configure webhooks for post created, user signup, etc. Coming soon.
        </p>
      </div>

      {/* Rate limits placeholder */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Rate Limits</h2>
        <p className="mt-2 text-sm text-slate-600">
          Configure per-IP or per-key rate limits. Coming soon.
        </p>
      </div>
    </div>
  );
}
