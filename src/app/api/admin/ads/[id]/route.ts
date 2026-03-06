import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const body = await request.json();
  const { adSpaceId, name, imageUrl, linkUrl, weight, active, startDate, endDate, order } = body;

  const updates: Record<string, unknown> = {};

  if (adSpaceId !== undefined) updates.adSpaceId = adSpaceId;
  if (name !== undefined) updates.name = String(name).trim();
  if (imageUrl !== undefined) updates.imageUrl = String(imageUrl).trim();
  if (linkUrl !== undefined) updates.linkUrl = String(linkUrl).trim();
  if (weight !== undefined) updates.weight = Math.max(0, Number(weight) || 0);
  if (active !== undefined) updates.active = Boolean(active);
  if (startDate !== undefined) updates.startDate = startDate ? new Date(startDate) : null;
  if (endDate !== undefined) updates.endDate = endDate ? new Date(endDate) : null;
  if (order !== undefined) updates.order = Number(order) || 0;

  const ad = await prisma.ad.update({
    where: { id },
    data: updates,
  });

  return NextResponse.json(ad);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  await prisma.ad.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
