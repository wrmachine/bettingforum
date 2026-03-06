import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { sumVotes } from "@/lib/vote-sum";
import { FeaturedToggle } from "@/components/FeaturedToggle";

export const metadata = {
  title: "Posts & Threads – Admin",
  robots: { index: false, follow: false },
};

const typeLabels: Record<string, string> = {
  thread: "Thread",
  product: "Product",
  listicle: "Listicle",
  article: "Article",
  bonus: "Bonus",
};

function postHref(type: string, slug: string): string {
  switch (type) {
    case "product":
      return `/products/${slug}`;
    case "listicle":
      return `/listicles/${slug}`;
    case "article":
      return `/articles/${slug}`;
    case "bonus":
      return `/bonuses/${slug}`;
    case "thread":
    default:
      return `/threads/${slug}`;
  }
}

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string }>;
}) {
  const result = await requireAdmin();
  if (result.error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        {result.error}
      </div>
    );
  }

  const params = await searchParams;
  const typeFilter = params.type;
  const statusFilter = params.status ?? "published";

  const where: Record<string, unknown> = {};
  if (typeFilter) where.type = typeFilter;
  if (statusFilter) where.status = statusFilter;

  const posts = await prisma.post.findMany({
    where,
    include: {
      author: { select: { username: true } },
      votes: { select: { value: true } },
      _count: { select: { comments: true } },
      bonus: { select: { featured: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/admin" className="text-sm text-slate-500 hover:text-slate-700">
            Admin
          </Link>
          <span className="text-slate-400"> → </span>
          <span className="text-sm font-medium text-slate-700">Posts</span>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Posts & Thread Management</h1>
          <p className="mt-1 text-slate-600">
            {posts.length} {typeFilter ? typeLabels[typeFilter as keyof typeof typeLabels]?.toLowerCase() ?? typeFilter : "post"}
            {posts.length !== 1 ? "s" : ""} · {statusFilter}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Type:</span>
        <Link
          href="/admin/posts"
          className={`rounded-lg px-3 py-2 text-sm font-medium ${
            !typeFilter ? "bg-felt text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          All
        </Link>
        {(["thread", "product", "listicle", "article", "bonus"] as const).map((t) => (
          <Link
            key={t}
            href={`/admin/posts?type=${t}`}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              typeFilter === t ? "bg-felt text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {typeLabels[t]}
          </Link>
        ))}
        <span className="ml-2 mr-1 text-slate-300">|</span>
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Status:</span>
        <Link
          href={`/admin/posts${typeFilter ? `?type=${typeFilter}` : ""}?status=published`}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            statusFilter === "published" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Published
        </Link>
        <Link
          href={`/admin/posts${typeFilter ? `?type=${typeFilter}` : ""}?status=draft`}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            statusFilter === "draft" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Draft
        </Link>
      </div>

      {/* Posts table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Votes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Comments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Promoted / Featured
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <Link
                      href={postHref(post.type, post.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-slate-900 hover:text-felt hover:underline"
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        post.type === "product"
                          ? "bg-blue-100 text-blue-800"
                          : post.type === "article"
                            ? "bg-violet-100 text-violet-800"
                            : post.type === "listicle"
                              ? "bg-amber-100 text-amber-800"
                              : post.type === "bonus"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {typeLabels[post.type] ?? post.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {post.author.username}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        post.status === "published"
                          ? "bg-green-100 text-green-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{sumVotes(post.votes)}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{post._count.comments}</td>
                  <td className="px-6 py-4">
                    {post.type === "bonus" ? (
                      <FeaturedToggle
                        slug={post.slug}
                        featured={post.bonus?.featured ?? false}
                        postType={post.type}
                      />
                    ) : post.promoted ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        Promoted
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {post.type === "product" && (
                        <Link
                          href={`/admin/products/${post.slug}/edit`}
                          className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline"
                        >
                          Edit product
                        </Link>
                      )}
                      {post.type === "listicle" && (
                        <Link
                          href={`/admin/listicles/${post.slug}/edit`}
                          className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline"
                        >
                          Edit listicle
                        </Link>
                      )}
                      {(post.type === "thread" || post.type === "article" || post.type === "bonus") && (
                        <Link
                          href={`/admin/posts/${post.slug}/edit`}
                          className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline"
                        >
                          Edit {post.type}
                        </Link>
                      )}
                      <Link
                        href={postHref(post.type, post.slug)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-felt hover:underline"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {posts.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-slate-500">No posts found. Try adjusting filters.</p>
            <p className="mt-3">
              <Link href="/admin/posts/new/article" className="text-sm font-medium text-felt hover:underline">
                Add your first {typeFilter ? typeLabels[typeFilter as keyof typeof typeLabels]?.toLowerCase() : "post"} →
              </Link>
            </p>
          </div>
        )}
      </div>

      <p className="mt-4 text-sm text-slate-500">
        Showing up to 100 posts. Use Edit product / Edit listicle to modify; View opens the live page.
      </p>
    </div>
  );
}
