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

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const items = await prisma.menuItem.findMany({
    include: { parent: true, children: true },
    orderBy: [{ location: "asc" }, { order: "asc" }],
  });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { label, href, order, location, parentId } = body;

  if (!label || typeof label !== "string") {
    return NextResponse.json({ error: "Label required" }, { status: 400 });
  }
  if (!href || typeof href !== "string") {
    return NextResponse.json({ error: "Href required" }, { status: 400 });
  }
  if (!location || !LOCATIONS.includes(location)) {
    return NextResponse.json({ error: "Valid location required" }, { status: 400 });
  }

  const item = await prisma.menuItem.create({
    data: {
      label,
      href,
      order: typeof order === "number" ? order : 0,
      location,
      parentId: parentId || null,
    },
  });

  return NextResponse.json(item);
}
