import { requireAdmin } from "@/lib/admin";
import dynamic from "next/dynamic";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

const ProductEditForm = dynamic(() => import("./ProductEditForm").then((m) => ({ default: m.ProductEditForm })), {
  loading: () => (
    <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-slate-500">
      Loading editor…
    </div>
  ),
});

export const metadata = {
  title: "Edit Product – Admin",
  robots: { index: false, follow: false },
};

export default async function AdminProductEditPage({
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
    where: { slug, type: "product" },
    include: { product: true },
  });

  if (!post?.product) {
    return (
      <div>
        <p className="text-slate-600">Product not found.</p>
        <Link href="/admin/posts" className="mt-4 inline-block text-felt hover:underline">
          ← Back to Posts
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin/posts" className="text-sm text-slate-600 hover:text-slate-900">
            ← Back to Posts
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Edit: {post.title}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Product ID: {post.product.id}
          </p>
        </div>
        <Link
          href={`/products/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-felt hover:underline"
        >
          View product →
        </Link>
      </div>

      <ProductEditForm
        product={post.product}
        post={{ slug, id: post.id, title: post.title, excerpt: post.excerpt, body: post.body }}
      />
    </div>
  );
}
