import { requireAdmin } from "@/lib/admin";
import { ListicleEditForm } from "./ListicleEditForm";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Edit Listicle – Admin",
  robots: { index: false, follow: false },
};

export default async function AdminListicleEditPage({
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
    where: { slug, type: "listicle" },
    include: {
      listicle: {
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  brandName: true,
                  shortDescription: true,
                  post: { select: { slug: true, title: true } },
                },
              },
            },
            orderBy: { position: "asc" },
          },
        },
      },
    },
  });

  if (!post?.listicle) {
    return (
      <div>
        <p className="text-slate-600">Listicle not found.</p>
        <Link href="/admin/posts?type=listicle" className="mt-4 inline-block text-felt hover:underline">
          ← Back to Posts
        </Link>
      </div>
    );
  }

  const products = await prisma.product.findMany({
    where: { post: { type: "product", status: "published" } },
    include: { post: { select: { slug: true, title: true } } },
    orderBy: { brandName: "asc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin/posts?type=listicle" className="text-sm text-slate-600 hover:text-slate-900">
            ← Back to Posts
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Edit: {post.title}
          </h1>
        </div>
        <Link
          href={`/listicles/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-felt hover:underline"
        >
          View listicle →
        </Link>
      </div>

      <ListicleEditForm
        slug={slug}
        initialData={{
          title: post.title,
          titleOverride: post.listicle.titleOverride,
          intro: post.listicle.intro,
          body: post.body ?? "",
          items: post.listicle.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            position: item.position,
            note: item.note,
            product: item.product,
          })),
        }}
        products={products.map((p) => ({
          id: p.id,
          brandName: p.brandName,
          slug: p.post.slug,
          title: p.post.title,
          productType: p.productType,
          bonusSummary: p.bonusSummary,
          shortDescription: p.shortDescription,
        }))}
      />
    </div>
  );
}
