/**
 * External API for posting articles, products, bonuses, threads, and listicles.
 * Use API key auth for programmatic access from external sources (syndication, affiliates, etc).
 *
 * Auth: Bearer <EXTERNAL_API_KEY> or X-API-Key: <EXTERNAL_API_KEY>
 * Requires: EXTERNAL_API_KEY and EXTERNAL_API_AUTHOR_USERNAME in .env
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/slug";

const VALID_TYPES = ["product", "listicle", "thread", "article", "bonus"] as const;
type PostType = (typeof VALID_TYPES)[number];

function getApiKey(request: NextRequest): string | null {
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const header = request.headers.get("x-api-key")?.trim();
  return bearer || header || null;
}

function requireExternalApiAuth(request: NextRequest): { error?: string; status?: number } {
  const apiKey = getApiKey(request);
  const expected = process.env.EXTERNAL_API_KEY;
  if (!expected) {
    return { error: "External API is not configured (EXTERNAL_API_KEY)", status: 503 };
  }
  if (!apiKey || apiKey !== expected) {
    return { error: "Invalid or missing API key. Use Authorization: Bearer <key> or X-API-Key: <key>", status: 401 };
  }
  return {};
}

export async function POST(request: NextRequest) {
  const auth = requireExternalApiAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status ?? 401 });
  }

  const authorUsername = process.env.EXTERNAL_API_AUTHOR_USERNAME ?? "api-external";
  const author = await prisma.user.findUnique({
    where: { username: authorUsername },
    select: { id: true },
  });
  if (!author) {
    return NextResponse.json(
      {
        error: `API author user "${authorUsername}" not found. Create a user with this username and set EXTERNAL_API_AUTHOR_USERNAME in .env`,
      },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    type,
    title,
    slug: slugOverride,
    excerpt,
    body: postBody,
    product,
    listicle,
    article,
    bonus,
    tags: tagSlugs,
    forum: forumSlug,
    status: statusParam,
  } = body;

  const typeStr = String(type || "").trim() as PostType;
  const titleStr = String(title || "").trim();

  if (!typeStr || !titleStr) {
    return NextResponse.json(
      { error: "type and title are required" },
      { status: 400 }
    );
  }

  if (!VALID_TYPES.includes(typeStr)) {
    return NextResponse.json(
      { error: `type must be one of: ${VALID_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  const status = statusParam === "draft" ? "draft" : "published";

  // Slug: allow override for idempotency, otherwise generate from title
  let slug: string;
  if (typeof slugOverride === "string" && slugOverride.trim()) {
    slug = slugOverride.trim().toLowerCase().replace(/\s+/g, "-");
  } else {
    slug = generateSlug(titleStr) || "post";
  }
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  }

  try {
    const post = await prisma.post.create({
      data: {
        title: titleStr,
        slug,
        type: typeStr,
        authorId: author.id,
        excerpt: excerpt != null ? String(excerpt) : null,
        body: postBody != null ? String(postBody) : null,
        forumSlug: typeStr === "thread" && forumSlug ? String(forumSlug) : null,
        status,
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
                  ...((listicle as { items?: { productId: string; position: number; note?: string }[] }).items
                    ?.length
                    ? {
                        items: {
                          create: (
                            listicle as { items: { productId: string; position: number; note?: string }[] }
                          ).items.map((item) => ({
                            productId: item.productId,
                            position: item.position,
                            note: item.note,
                          })),
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

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        slug: post.slug,
        title: post.title,
        type: post.type,
        status: post.status,
        author: post.author.username,
        createdAt: post.createdAt,
      },
    });
  } catch (err) {
    const prismaErr = err as { code?: string; meta?: { target?: string[] } };
    if (prismaErr.code === "P2002" && prismaErr.meta?.target?.includes("slug")) {
      return NextResponse.json(
        { error: "Slug collision. Try a different slug or title." },
        { status: 409 }
      );
    }
    if (prismaErr.code === "P2003") {
      return NextResponse.json(
        { error: "Invalid productId reference (e.g. in bonus.productId or listicle items)" },
        { status: 400 }
      );
    }
    console.error("POST /api/v1/external/posts error:", err);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
