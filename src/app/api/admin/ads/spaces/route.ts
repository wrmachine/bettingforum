import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const spaces = await prisma.adSpace.findMany({
    include: {
      _count: { select: { ads: true } },
      ads: {
        select: { id: true, name: true, active: true, clicks: true, impressions: true },
      },
    },
    orderBy: { slot: "asc" },
  });

  return NextResponse.json(spaces);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { name, slot, width, height, rotation, enabled } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }
  if (!slot || typeof slot !== "string") {
    return NextResponse.json({ error: "slot required" }, { status: 400 });
  }

  const slotNormalized = slot.trim().toLowerCase().replace(/\s+/g, "_");

  const space = await prisma.adSpace.create({
    data: {
      name: name.trim(),
      slot: slotNormalized,
      width: typeof width === "number" && width > 0 ? width : 300,
      height: typeof height === "number" && height > 0 ? height : 250,
      rotation: ["random", "round_robin", "weighted"].includes(rotation) ? rotation : "random",
      enabled: enabled !== false,
    },
  });

  return NextResponse.json(space);
}
