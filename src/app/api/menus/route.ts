import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location");

  if (!location) {
    return NextResponse.json({ error: "location query param required" }, { status: 400 });
  }

  const items = await prisma.menuItem.findMany({
    where: { location, parentId: null },
    include: {
      children: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(items);
}
