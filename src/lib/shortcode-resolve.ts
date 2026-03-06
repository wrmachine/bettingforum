import { prisma } from "@/lib/prisma";
import type { ShortcodeRef } from "./shortcodes";

export type ResolvedProduct = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  productType: string;
  bonusSummary: string | null;
  siteUrl: string | null;
  logoUrl: string | null;
};

export type ResolvedBonus = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  offerValue: string | null;
  promoCode: string | null;
  product?: {
    brandName: string;
    slug: string;
    siteUrl: string | null;
    logoUrl: string | null;
  } | null;
};

export type ShortcodeData = {
  products: Map<string, ResolvedProduct>;
  bonuses: Map<string, ResolvedBonus>;
};

/**
 * Resolve shortcode refs to product/bonus data. Fetches from DB.
 */
export async function resolveShortcodes(refs: ShortcodeRef[]): Promise<ShortcodeData> {
  const productSlugs = new Set<string>();
  const bonusSlugs = new Set<string>();
  for (const ref of refs) {
    if (ref.type === "bonus") {
      bonusSlugs.add(ref.slug);
    } else {
      productSlugs.add(ref.slug);
    }
  }

  const products = new Map<string, ResolvedProduct>();
  const bonuses = new Map<string, ResolvedBonus>();

  if (productSlugs.size > 0) {
    const productPosts = await prisma.post.findMany({
      where: {
        slug: { in: [...productSlugs] },
        type: "product",
        status: "published",
      },
      include: {
        product: true,
      },
    });
    for (const p of productPosts) {
      if (p.product) {
        products.set(p.slug, {
          id: p.product.id,
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          productType: p.product.productType,
          bonusSummary: p.product.bonusSummary,
          siteUrl: p.product.siteUrl,
          logoUrl: p.product.logoUrl,
        });
      }
    }
  }

  if (bonusSlugs.size > 0) {
    const bonusPosts = await prisma.post.findMany({
      where: {
        slug: { in: [...bonusSlugs] },
        type: "bonus",
        status: "published",
      },
      include: {
        bonus: {
          include: {
            product: {
              include: { post: { select: { slug: true } } },
            },
          },
        },
      },
    });
    for (const p of bonusPosts) {
      if (p.bonus) {
        const prod = p.bonus.product;
        bonuses.set(p.slug, {
          id: p.bonus.id,
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          offerValue: p.bonus.offerValue,
          promoCode: p.bonus.promoCode,
          product: prod
            ? {
                brandName: prod.brandName,
                slug: prod.post?.slug ?? p.slug,
                siteUrl: prod.siteUrl,
                logoUrl: prod.logoUrl,
              }
            : null,
        });
      }
    }
  }

  return { products, bonuses };
}
