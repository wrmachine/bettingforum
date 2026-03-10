import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sumVotes } from "@/lib/vote-sum";
import { requireAdmin } from "@/lib/admin";
import { resolvePostId } from "@/lib/post-resolve";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { slug } = await params;
  const postId = await resolvePostId(slug);
  if (!postId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const { promoted, featured, status: statusParam, title, excerpt, postBody, article: articleData } = body;

  const existing = await prisma.post.findUnique({
    where: { id: postId },
    select: { type: true, bonus: { select: { id: true } }, article: { select: { id: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (typeof promoted === "boolean" && existing.type === "thread") {
    const post = await prisma.post.update({
      where: { id: postId },
      data: { promoted },
      select: { id: true, slug: true, promoted: true },
    });
    return NextResponse.json(post);
  }

  if (statusParam === "published" || statusParam === "draft") {
    await prisma.post.update({
      where: { id: postId },
      data: { status: statusParam },
    });
    return NextResponse.json({ slug: (await prisma.post.findUnique({ where: { id: postId }, select: { slug: true } }))?.slug, status: statusParam });
  }

  if (typeof featured === "boolean" && existing.type === "bonus" && existing.bonus) {
    await prisma.bonus.update({
      where: { id: existing.bonus.id },
      data: { featured },
    });
    return NextResponse.json({ slug: (await prisma.post.findUnique({ where: { id: postId }, select: { slug: true } }))?.slug, featured });
  }

  // Update post fields (title, excerpt, body) for product, article, bonus, listicle
  const postUpdates: Record<string, unknown> = {};
  if (typeof title === "string" && title.trim()) {
    postUpdates.title = title.trim();
  }
  if (excerpt !== undefined) {
    postUpdates.excerpt = excerpt === null || excerpt === "" ? null : String(excerpt);
  }
  if (postBody !== undefined) {
    postUpdates.body = postBody === null || postBody === "" ? null : String(postBody);
  }
  if (Object.keys(postUpdates).length > 0) {
    await prisma.post.update({
      where: { id: postId },
      data: postUpdates,
    });
  }

  // Update article-specific fields
  if (
    articleData &&
    typeof articleData === "object" &&
    existing?.type === "article"
  ) {
    const { featuredImageUrl, subheadline, lead } = articleData;
    const articleUpdates: Record<string, unknown> = {};
    if (featuredImageUrl !== undefined) {
      articleUpdates.featuredImageUrl = featuredImageUrl === null || featuredImageUrl === "" ? null : String(featuredImageUrl);
    }
    if (subheadline !== undefined) {
      articleUpdates.subheadline = subheadline === null || subheadline === "" ? null : String(subheadline);
    }
    if (lead !== undefined) {
      articleUpdates.lead = lead === null || lead === "" ? null : String(lead);
    }
    if (Object.keys(articleUpdates).length > 0) {
      if (existing.article?.id) {
        await prisma.article.update({
          where: { id: existing.article.id },
          data: articleUpdates,
        });
      } else {
        await prisma.article.create({
          data: {
            postId,
            ...articleUpdates,
          },
        });
      }
    }
  }

  if (Object.keys(postUpdates).length > 0 || (articleData && existing?.type === "article")) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, slug: true, title: true, excerpt: true, body: true },
    });
    return NextResponse.json(post);
  }

  const err =
    typeof promoted === "boolean" ? "Only threads can be promoted" :
    typeof featured === "boolean" ? "Only bonuses can be featured" :
    "Provide promoted (boolean) for threads, featured (boolean) for bonuses, or title/excerpt/postBody for post updates";
  return NextResponse.json({ error: err }, { status: 400 });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug, status: "published" },
    include: {
      author: { select: { id: true, username: true, role: true, avatarUrl: true } },
      product: {
        include: {
          reviews: { select: { rating: true } },
        },
      },
      listicle: {
        include: {
          items: {
            include: { product: { include: { post: true } } },
            orderBy: { position: "asc" },
          },
        },
      },
      article: true,
      bonus: {
        include: {
          product: {
            select: {
              id: true,
              brandName: true,
              siteUrl: true,
              logoUrl: true,
              post: { select: { slug: true } },
            },
          },
        },
      },
      votes: { select: { value: true } },
      _count: { select: { comments: true } },
      postTags: { include: { tag: true } },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data = {
    ...post,
    votes: sumVotes(post.votes),
    comments: post._count.comments,
    tags: post.postTags.map((pt) => pt.tag),
    _count: undefined,
    postTags: undefined,
  };

  return NextResponse.json(data);
}
