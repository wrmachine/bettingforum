import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import {
  PARTNER_SPORTSBOOKS_KEY,
  getPartnerSportsbooks,
  type PartnerLink,
} from "@/lib/partner-sportsbooks";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const links = await getPartnerSportsbooks();
  const catalog = await prisma.product.findMany({
    where: { productType: "sportsbook", siteUrl: { not: null } },
    select: {
      brandName: true,
      siteUrl: true,
      post: { select: { slug: true } },
    },
    orderBy: { brandName: "asc" },
    take: 200,
  });

  return NextResponse.json({
    links,
    catalog: catalog.map((c) => ({
      label: c.brandName,
      url: c.siteUrl,
      productSlug: c.post.slug,
    })),
  });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: { links?: PartnerLink[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const links = Array.isArray(body.links) ? body.links : [];
  const cleaned: PartnerLink[] = [];
  for (const item of links) {
    if (!item || typeof item !== "object") continue;
    const label = String((item as PartnerLink).label ?? "").trim();
    let url = String((item as PartnerLink).url ?? "").trim();
    if (!label || !url) continue;
    try {
      const u = new URL(url);
      if (u.protocol !== "http:" && u.protocol !== "https:") continue;
      url = u.href;
    } catch {
      continue;
    }
    cleaned.push({ label, url });
  }

  await prisma.seoSettings.upsert({
    where: { key: PARTNER_SPORTSBOOKS_KEY },
    create: { key: PARTNER_SPORTSBOOKS_KEY, value: JSON.stringify(cleaned) },
    update: { value: JSON.stringify(cleaned) },
  });

  return NextResponse.json({ ok: true, links: cleaned });
}
