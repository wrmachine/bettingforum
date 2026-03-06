import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
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
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    titleOverride: post.listicle.titleOverride,
    intro: post.listicle.intro,
    items: post.listicle.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      position: item.position,
      note: item.note,
      product: item.product,
    })),
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug, type: "listicle" },
    include: { listicle: { include: { items: true } } },
  });

  if (!post?.listicle) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const { title, titleOverride, intro, body: postBody, items } = body;

  // Update post title and body if provided
  const postUpdates: { title?: string; body?: string | null } = {};
  if (typeof title === "string" && title.trim()) postUpdates.title = title.trim();
  if (postBody !== undefined) postUpdates.body = postBody === null || postBody === "" ? null : String(postBody);
  if (Object.keys(postUpdates).length > 0) {
    await prisma.post.update({
      where: { id: post.id },
      data: postUpdates,
    });
  }

  // Update listicle titleOverride and intro
  await prisma.listicle.update({
    where: { id: post.listicle.id },
    data: {
      titleOverride: titleOverride !== undefined ? (titleOverride?.trim() || null) : undefined,
      intro: intro !== undefined ? (intro?.trim() || null) : undefined,
    },
  });

  // Replace items if provided
  if (Array.isArray(items)) {
    await prisma.listicleItem.deleteMany({
      where: { listicleId: post.listicle.id },
    });
    if (items.length > 0) {
      await prisma.listicleItem.createMany({
        data: items.map((item: { productId: string; position: number; note?: string }, i: number) => ({
          listicleId: post.listicle!.id,
          productId: item.productId,
          position: typeof item.position === "number" ? item.position : i,
          note: item.note?.trim() || null,
        })),
      });
    }
  }

  const updated = await prisma.post.findUnique({
    where: { id: post.id },
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

  return NextResponse.json(updated);
}
