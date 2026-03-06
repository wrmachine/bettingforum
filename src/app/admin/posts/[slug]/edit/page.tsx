import { requireAdmin } from "@/lib/admin";
import { PostEditForm } from "./PostEditForm";
import { ArticleEditForm } from "./ArticleEditForm";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Edit Post – Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPostEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const result = await requireAdmin();
  if (result.error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        {result.error}
      </div>
    );
  }

  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      body: true,
      type: true,
      article: { select: { featuredImageUrl: true, subheadline: true, lead: true } },
    },
  });

  if (!post) {
    return (
      <div>
        <p className="text-slate-600">Post not found.</p>
        <Link href="/admin/posts" className="mt-4 inline-block text-felt hover:underline">
          ← Back to Posts
        </Link>
      </div>
    );
  }

  const allowedTypes = ["thread", "article", "bonus"];
  if (!allowedTypes.includes(post.type)) {
    return (
      <div>
        <p className="text-slate-600">
          Use the dedicated edit page for {post.type}s:{" "}
          {post.type === "product" && (
            <Link href={`/admin/products/${slug}/edit`} className="text-felt hover:underline">
              Edit product →
            </Link>
          )}
          {post.type === "listicle" && (
            <Link href={`/admin/listicles/${slug}/edit`} className="text-felt hover:underline">
              Edit listicle →
            </Link>
          )}
        </p>
        <Link href="/admin/posts" className="mt-4 inline-block text-felt hover:underline">
          ← Back to Posts
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/posts" className="text-sm text-slate-600 hover:text-slate-900">
          ← Back to Posts
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Edit: {post.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">Type: {post.type}</p>
      </div>

      {post.type === "article" ? (
        <ArticleEditForm
          slug={post.slug}
          initialData={{
            title: post.title,
            excerpt: post.excerpt ?? "",
            body: post.body ?? "",
            featuredImageUrl: post.article?.featuredImageUrl ?? "",
            subheadline: post.article?.subheadline ?? "",
            lead: post.article?.lead ?? "",
          }}
        />
      ) : (
        <PostEditForm
          slug={post.slug}
          initialData={{
            title: post.title,
            excerpt: post.excerpt ?? "",
            body: post.body ?? "",
          }}
        />
      )}
    </div>
  );
}
