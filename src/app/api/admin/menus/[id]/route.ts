import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const LOCATIONS = [
  "header_main",
  "header_secondary",
  "footer_services",
  "footer_helpful",
  "footer_information",
  "footer_legal",
];

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
  const { label, href, order, location, parentId } = body;

  const updates: { label?: string; href?: string; order?: number; location?: string; parentId?: string | null } = {};

  if (label !== undefined) {
    if (!label || typeof label !== "string") {
      return NextResponse.json({ error: "Label required" }, { status: 400 });
    }
    updates.label = label;
  }
  if (href !== undefined) {
    if (!href || typeof href !== "string") {
      return NextResponse.json({ error: "Href required" }, { status: 400 });
    }
    updates.href = href;
  }
  if (order !== undefined) {
    updates.order = typeof order === "number" ? order : 0;
  }
  if (location !== undefined) {
    if (!LOCATIONS.includes(location)) {
      return NextResponse.json({ error: "Valid location required" }, { status: 400 });
    }
    updates.location = location;
  }
  if (parentId !== undefined) {
    updates.parentId = parentId || null;
  }

  const item = await prisma.menuItem.update({
    where: { id },
    data: updates,
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
  await prisma.menuItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
