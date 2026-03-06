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

  const validFreq = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"];
  const data: Record<string, unknown> = {};
  if (body.pathPattern) data.pathPattern = body.pathPattern;
  if (typeof body.priority === "number") data.priority = Math.min(1, Math.max(0, body.priority));
  if (validFreq.includes(body.changeFreq)) data.changeFreq = body.changeFreq;
  if (typeof body.enabled === "boolean") data.enabled = body.enabled;

  const item = await prisma.sitemapConfig.update({
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
  await prisma.sitemapConfig.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
