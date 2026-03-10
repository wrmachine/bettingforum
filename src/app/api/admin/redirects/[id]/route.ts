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

  const data: { source?: string; destination?: string; enabled?: boolean } = {};
  if (body.source != null) {
    data.source = body.source.startsWith("/") ? body.source : `/${body.source}`;
  }
  if (body.destination != null) {
    data.destination = body.destination.startsWith("/") ? body.destination : `/${body.destination}`;
  }
  if (body.enabled !== undefined) data.enabled = body.enabled;

  const item = await prisma.redirect.update({
    where: { id },
    data,
  });
  return NextResponse.json(item);
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
  await prisma.redirect.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
