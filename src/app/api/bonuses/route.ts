import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sumVotes } from "@/lib/vote-sum";

const BONUS_PRODUCT_TYPES = ["sportsbook", "casino", "crypto"];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortParam = searchParams.get("sort") ?? "top";
    const typeParam = searchParams.get("type");
    const providerParam = searchParams.get("provider"); // product slug for filter by provider

    const where: Record<string, unknown> = { type: "bonus", status: "published" };
    const bonusFilter: Record<string, unknown> = {};
    const productFilter: Record<string, unknown> = {};
    if (typeParam && BONUS_PRODUCT_TYPES.includes(typeParam)) {
      productFilter.productType = { contains: typeParam };
    }
    if (providerParam) {
      productFilter.post = { slug: providerParam };
    }
    if (Object.keys(productFilter).length > 0) {
      bonusFilter.product = { is: productFilter };
    }
    if (sortParam === "expiring") {
      bonusFilter.expiresAt = { not: null, gte: new Date() };
    }
    if (Object.keys(bonusFilter).length > 0) {
      where.bonus = { is: bonusFilter };
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: { select: { username: true } },
        votes: { select: { value: true } },
        _count: { select: { comments: true } },
        postTags: { include: { tag: true } },
        bonus: {
          include: {
            product: {
              select: {
                brandName: true,
                siteUrl: true,
                logoUrl: true,
                post: { select: { slug: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" as const },
      take: 100,
    });

    const voteSum = (p: (typeof posts)[0]) => sumVotes(p.votes);
    if (sortParam === "top") {
      posts.sort((a, b) => voteSum(b) - voteSum(a));
    } else if (sortParam === "new") {
      posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sortParam === "expiring") {
      posts.sort((a, b) => {
        const aExp = a.bonus?.expiresAt?.getTime() ?? Infinity;
        const bExp = b.bonus?.expiresAt?.getTime() ?? Infinity;
        return aExp - bExp;
      });
    }

    // Featured bonuses first (preserving sort order within each group)
    const featured = posts.filter((p) => p.bonus?.featured);
    const nonFeatured = posts.filter((p) => !p.bonus?.featured);
    const orderedPosts = [...featured, ...nonFeatured];

    const data = orderedPosts.slice(0, 50).map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      type: "bonus",
      excerpt: p.excerpt,
      author: p.author.username,
      votes: sumVotes(p.votes),
      comments: p._count.comments,
      tags: p.postTags.map((pt) => pt.tag.name),
      createdAt: p.createdAt,
      featured: p.bonus?.featured ?? false,
      offerValue: p.bonus?.offerValue ?? null,
      promoCode: p.bonus?.promoCode ?? null,
      terms: p.bonus?.terms ?? null,
      claimUrl: p.bonus?.claimUrl ?? null,
      expiresAt: p.bonus?.expiresAt ?? null,
      product: p.bonus?.product
        ? {
            brandName: p.bonus.product.brandName,
            siteUrl: p.bonus.product.siteUrl,
            logoUrl: p.bonus.product.logoUrl,
            slug: p.bonus.product.post.slug,
          }
        : null,
    }));

    // Fetch providers (products with bonuses) for the filter dropdown
    const providersWithBonuses = await prisma.product.findMany({
      where: {
        bonuses: { some: {} },
        post: { type: "product", status: "published" },
      },
      select: {
        brandName: true,
        post: { select: { slug: true } },
      },
      orderBy: { brandName: "asc" },
    });
    const providers = providersWithBonuses.map((p) => ({
      slug: p.post.slug,
      brandName: p.brandName,
    }));

    return NextResponse.json({ bonuses: data, providers });
  } catch (error) {
    console.error("GET /api/bonuses error:", error);
    return NextResponse.json({ error: "Failed to fetch bonuses" }, { status: 500 });
  }
}
