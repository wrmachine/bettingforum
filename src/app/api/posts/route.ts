import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sumVotes } from "@/lib/vote-sum";
import { generateSlug } from "@/lib/slug";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const tag = searchParams.get("tag"); // tag slug for filtering (e.g. strategy, ama)
    const forum = searchParams.get("forum"); // forum slug (e.g. bet-general) — threads belong to a forum
    const authorRole = searchParams.get("authorRole"); // "user" = only posts from non-admin users
    const productSlug = searchParams.get("productSlug"); // bonus forums: filter by product
    const timeRange = searchParams.get("timeRange");
    const sortParam = searchParams.get("sort") ?? "top";
    const q = searchParams.get("q")?.trim(); // text search: title, excerpt, body
    // Support Product Hunt-style: top|best, new, trending
    const sort = sortParam === "best" ? "top" : sortParam;

    const productTypes = ["sportsbook", "casino", "crypto", "tool", "tipster"];
    const where: Record<string, unknown> = { status: "published" };

    // Text search: sanitize q to avoid LIKE wildcards (% and _)
    if (q && q.length >= 2) {
      const safeQ = q.replace(/%/g, "").replace(/_/g, " ");
      where.OR = [
        { title: { contains: safeQ } },
        { excerpt: { contains: safeQ } },
        { body: { contains: safeQ } },
      ];
      // Default to threads when searching (matches "Search all threads")
      if (!type) where.type = "thread";
    }
    if (type) {
      if (productTypes.includes(type)) {
        where.type = "product";
        // Match products that include this type (supports legacy single string + JSON array)
        where.product = { is: { productType: { contains: type } } };
      } else if (type.includes(",")) {
        // Support multiple types, e.g. type=thread,article for blended articles
        const types = type.split(",").map((t) => t.trim()).filter(Boolean);
        if (types.length > 0) {
          where.type = { in: types };
        }
      } else {
        where.type = type;
      }
    }

    if (tag) {
      where.postTags = { some: { tag: { slug: tag } } };
    }

    if (productSlug) {
      where.bonus = { is: { product: { is: { post: { slug: productSlug } } } } };
    }

    // Thread forums: show threads with forumSlug match, or null (legacy) for topic/sports forums
    if (forum && type === "thread") {
      const slugMatches = [{ forumSlug: forum }];
      const legacyNull = ["bet-general", "bet-strategy", "bet-ama", "bet-introduce-yourself", "bet-promotions"].includes(forum) ||
        forum.startsWith("sport-");
      where.OR = legacyNull ? [...slugMatches, { forumSlug: null }] : slugMatches;
    }

    if (authorRole === "user") {
      where.author = { role: "user" };
    }

    if (timeRange) {
      const now = new Date();
      switch (timeRange) {
        case "today": {
          const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          where.createdAt = { gte: start };
          break;
        }
        case "yesterday": {
          const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          where.createdAt = { gte: start, lt: end };
          break;
        }
        case "week": {
          const start = new Date(now);
          start.setDate(start.getDate() - 7);
          where.createdAt = { gte: start };
          break;
        }
        case "month": {
          const start = new Date(now);
          start.setMonth(start.getMonth() - 1);
          where.createdAt = { gte: start };
          break;
        }
      }
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: { select: { username: true } },
        votes: { select: { value: true } },
        _count: { select: { comments: true } },
        postTags: { include: { tag: true } },
        article: { select: { featuredImageUrl: true } },
        product: {
          select: {
            id: true,
            productType: true,
            bonusSummary: true,
            siteUrl: true,
            logoUrl: true,
            reviews: { select: { rating: true } },
          },
        },
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
      orderBy:
        sort === "new"
          ? { createdAt: "desc" as const }
          : { createdAt: "desc" as const },
      take: 100,
    });

    // Sort: top/best (votes), new (createdAt), trending (engagement score)
    const voteSum = (p: (typeof posts)[0]) => sumVotes(p.votes);
    if (sort === "top") {
      posts.sort((a, b) => voteSum(b) - voteSum(a));
    } else if (sort === "trending") {
      posts.sort(
        (a, b) =>
          voteSum(b) + b._count.comments * 2 -
          (voteSum(a) + a._count.comments * 2)
      );
    }
    // "new" keeps createdAt desc from query
    const limited = posts.slice(0, 50);

    const data = limited.map((p) => {
      const base = {
        id: p.id,
        title: p.title,
        slug: p.slug,
        type: p.type,
        excerpt: p.excerpt,
        author: p.author.username,
        votes: sumVotes(p.votes),
        comments: p._count.comments,
        tags: p.postTags.map((pt) => pt.tag.name),
        createdAt: p.createdAt,
        ...(p.type === "article" && p.article && {
          featuredImageUrl: p.article.featuredImageUrl,
        }),
      };
      if (p.type === "product" && p.product) {
        const reviews = p.product.reviews;
        const reviewCount = reviews.length;
        const avgRating = reviewCount
          ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviewCount) * 10) / 10
          : null;
        return {
          ...base,
          productId: p.product.id,
          productType: p.product.productType,
          bonusSummary: p.product.bonusSummary,
          siteUrl: p.product.siteUrl,
          logoUrl: p.product.logoUrl,
          rating: avgRating,
          reviewCount,
        };
      }
      if (p.type === "bonus" && p.bonus) {
        return {
          ...base,
          featured: p.bonus.featured,
          offerValue: p.bonus.offerValue,
          promoCode: p.bonus.promoCode,
          terms: p.bonus.terms,
          claimUrl: p.bonus.claimUrl,
          expiresAt: p.bonus.expiresAt,
          product: p.bonus.product
            ? {
                brandName: p.bonus.product.brandName,
                siteUrl: p.bonus.product.siteUrl,
                logoUrl: p.bonus.product.logoUrl,
                slug: p.bonus.product.post.slug,
              }
            : null,
        };
      }
      return base;
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { type, title, excerpt, body: postBody, product, listicle, article, bonus, tags: tagSlugs, forum: forumSlug } = body;

  const typeStr = String(type || "").trim();
  const titleStr = String(title || "").trim();

  if (!typeStr || !titleStr) {
    return NextResponse.json(
      { error: "type and title are required" },
      { status: 400 }
    );
  }

  // Generate unique slug — append random suffix if collision
  const baseSlug = generateSlug(titleStr) || "post";
  let slug = baseSlug;
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) {
    slug = `${baseSlug}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  }

  try {
  const post = await prisma.post.create({
    data: {
      title: titleStr,
      slug,
      type: typeStr,
      authorId: session.user.id,
      excerpt: excerpt != null ? String(excerpt) : null,
      body: postBody != null ? String(postBody) : null,
      forumSlug: typeStr === "thread" && forumSlug ? String(forumSlug) : null,
      status: "published",
      ...(typeStr === "product" && product
        ? {
            product: {
              create: {
                brandName: (product as { brandName?: string }).brandName ?? titleStr,
                siteUrl: (product as { siteUrl?: string }).siteUrl,
                productType: (product as { productType?: string }).productType ?? "sportsbook",
                licenseJurisdiction: (product as { licenseJurisdiction?: string }).licenseJurisdiction,
                geoRestrictions: (product as { geoRestrictions?: string }).geoRestrictions,
                fiatSupported: (product as { fiatSupported?: boolean }).fiatSupported ?? true,
                cryptoSupported: (product as { cryptoSupported?: boolean }).cryptoSupported ?? false,
                bonusSummary: (product as { bonusSummary?: string }).bonusSummary,
                minDeposit: (product as { minDeposit?: string }).minDeposit,
                shortDescription: (product as { shortDescription?: string | null }).shortDescription ?? null,
                logoUrl: (product as { logoUrl?: string | null }).logoUrl ?? null,
                media: (product as { media?: string | null }).media ?? null,
                bankingMethods: (product as { bankingMethods?: string | null }).bankingMethods ?? null,
                cryptoMethods: (product as { cryptoMethods?: string | null }).cryptoMethods ?? null,
                acceptedCurrencies: (product as { acceptedCurrencies?: string | null }).acceptedCurrencies ?? null,
              },
            },
          }
        : {}),
      ...(typeStr === "listicle" && listicle
        ? {
            listicle: {
              create: {
                titleOverride: (listicle as { titleOverride?: string }).titleOverride,
                intro: (listicle as { intro?: string }).intro,
                ...((listicle as { items?: { productId: string; position: number; note?: string }[] }).items?.length
                  ? {
                      items: {
                        create: (listicle as { items: { productId: string; position: number; note?: string }[] }).items.map(
                          (item) => ({ productId: item.productId, position: item.position, note: item.note })
                        ),
                      },
                    }
                  : {}),
              },
            },
          }
        : {}),
      ...(typeStr === "article"
        ? {
            article: {
              create: {
                featuredImageUrl: (article as { featuredImageUrl?: string | null })?.featuredImageUrl ?? null,
                subheadline: (article as { subheadline?: string | null })?.subheadline ?? null,
                lead: (article as { lead?: string | null })?.lead ?? null,
              },
            },
          }
        : {}),
      ...(typeStr === "bonus" && bonus
        ? {
            bonus: {
              create: {
                productId: (bonus as { productId?: string | null }).productId ?? null,
                offerValue: (bonus as { offerValue?: string | null }).offerValue ?? null,
                promoCode: (bonus as { promoCode?: string | null }).promoCode ?? null,
                terms: (bonus as { terms?: string | null }).terms ?? null,
                claimUrl: (bonus as { claimUrl?: string | null }).claimUrl ?? null,
                expiresAt: (bonus as { expiresAt?: string | null }).expiresAt
                  ? new Date((bonus as { expiresAt: string }).expiresAt)
                  : null,
              },
            },
          }
        : {}),
    },
    include: {
      author: { select: { username: true } },
      postTags: { include: { tag: true } },
    },
  });

  if (tagSlugs && Array.isArray(tagSlugs) && tagSlugs.length > 0) {
    const slugStrings = [...new Set((tagSlugs as unknown[]).map((s) => String(s)))];
    const tags = await prisma.tag.findMany({ where: { slug: { in: slugStrings } } });
    if (tags.length > 0) {
      const tagData = tags.map((t) => ({ postId: post.id, tagId: t.id }));
      await prisma.postTag.createMany({ data: tagData });
    }
  }

  return NextResponse.json(post);
  } catch (err) {
    const prismaErr = err as { code?: string; meta?: { target?: string[] } };
    if (prismaErr.code === "P2002" && prismaErr.meta?.target?.includes("slug")) {
      return NextResponse.json(
        { error: "A thread with this title already exists. Try a different title." },
        { status: 409 }
      );
    }
    console.error("POST /api/posts error:", err);
    return NextResponse.json(
      { error: "Failed to create post. Please try again." },
      { status: 500 }
    );
  }
}
