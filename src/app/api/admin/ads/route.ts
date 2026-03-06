import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const adSpaceId = searchParams.get("adSpaceId");

  const where = adSpaceId ? { adSpaceId } : {};

  const ads = await prisma.ad.findMany({
    where,
    include: {
      adSpace: { select: { id: true, name: true, slot: true } },
    },
    orderBy: [{ adSpaceId: "asc" }, { order: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(ads);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { adSpaceId, name, imageUrl, linkUrl, weight, active, startDate, endDate, order } = body;

  if (!adSpaceId || typeof adSpaceId !== "string") {
    return NextResponse.json({ error: "adSpaceId required" }, { status: 400 });
  }
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }
  if (!imageUrl || typeof imageUrl !== "string") {
    return NextResponse.json({ error: "imageUrl required" }, { status: 400 });
  }
  if (!linkUrl || typeof linkUrl !== "string") {
    return NextResponse.json({ error: "linkUrl required" }, { status: 400 });
  }

  const ad = await prisma.ad.create({
    data: {
      adSpaceId,
      name: name.trim(),
      imageUrl: imageUrl.trim(),
      linkUrl: linkUrl.trim(),
      weight: typeof weight === "number" && weight >= 0 ? weight : 1,
      active: active !== false,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      order: typeof order === "number" ? order : 0,
    },
  });

  return NextResponse.json(ad);
}
