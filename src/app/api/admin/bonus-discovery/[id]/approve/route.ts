import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/slug";
import { BONUS_TYPE_SLUGS } from "@/lib/bonus-types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (!auth.session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!prisma.discoveredBonus) {
    return NextResponse.json(
      { error: "DiscoveredBonus model missing. Stop dev server, run: npx prisma generate, then restart." },
      { status: 503 }
    );
  }

  const discovered = await prisma.discoveredBonus.findUnique({
    where: { id },
    include: { product: { include: { post: { select: { slug: true } } } } },
  });

  if (!discovered || discovered.status !== "pending") {
    return NextResponse.json(
      { error: "Not found or already processed" },
      { status: 404 }
    );
  }

  const title =
    discovered.offerValue || `${discovered.brandName} Bonus` + (discovered.promoCode ? ` - ${discovered.promoCode}` : "");
  let slug = generateSlug(title) || "bonus";
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const [post] = await prisma.$transaction([
    prisma.post.create({
      data: {
        title,
        slug,
        excerpt: discovered.terms ?? discovered.offerValue ?? "",
        type: "bonus",
        authorId: auth.session.user.id,
        status: "published",
        bonus: {
          create: {
            productId: discovered.productId,
            offerValue: discovered.offerValue,
            promoCode: discovered.promoCode,
            terms: discovered.terms,
            claimUrl: discovered.claimUrl,
          },
        },
      },
      select: { id: true, slug: true },
    }),
    prisma.discoveredBonus.update({
      where: { id },
      data: { status: "approved", approvedAt: new Date() },
    }),
  ]);

  // Add bonus type tag if AI assigned one
  if (discovered.bonusType && (BONUS_TYPE_SLUGS as readonly string[]).includes(discovered.bonusType)) {
    const tag = await prisma.tag.findUnique({ where: { slug: discovered.bonusType } });
    if (tag) {
      await prisma.postTag.create({ data: { postId: post.id, tagId: tag.id } });
    }
  }

  return NextResponse.json({
    success: true,
    slug: post.slug,
    url: `/bonuses/${post.slug}`,
  });
}
