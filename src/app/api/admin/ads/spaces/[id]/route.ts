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
  const { name, slot, width, height, rotation, enabled } = body;

  const updates: Record<string, unknown> = {};

  if (name !== undefined) updates.name = String(name).trim();
  if (slot !== undefined) updates.slot = String(slot).trim().toLowerCase().replace(/\s+/g, "_");
  if (width !== undefined) updates.width = Math.max(1, Number(width) || 300);
  if (height !== undefined) updates.height = Math.max(1, Number(height) || 250);
  if (rotation !== undefined) {
    updates.rotation = ["random", "round_robin", "weighted"].includes(rotation) ? rotation : "random";
  }
  if (enabled !== undefined) updates.enabled = Boolean(enabled);

  const space = await prisma.adSpace.update({
    where: { id },
    data: updates,
  });

  return NextResponse.json(space);
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
  await prisma.adSpace.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
