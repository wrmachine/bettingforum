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

  const item = await prisma.pageMeta.update({
    where: { id },
    data: {
      ...(body.pathPattern && { pathPattern: body.pathPattern }),
      ...(body.title !== undefined && { title: body.title || null }),
      ...(body.description !== undefined && { description: body.description || null }),
      ...(body.ogTitle !== undefined && { ogTitle: body.ogTitle || null }),
      ...(body.ogDescription !== undefined && { ogDescription: body.ogDescription || null }),
      ...(body.ogImage !== undefined && { ogImage: body.ogImage || null }),
      ...(body.twitterCard !== undefined && { twitterCard: body.twitterCard || null }),
      ...(body.noIndex !== undefined && { noIndex: body.noIndex }),
      ...(body.noFollow !== undefined && { noFollow: body.noFollow }),
      ...(body.canonical !== undefined && { canonical: body.canonical || null }),
    },
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
  await prisma.pageMeta.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
