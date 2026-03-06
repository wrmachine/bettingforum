import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

  if (!prisma.discoveredBonus) {
    return NextResponse.json(
      { error: "DiscoveredBonus model missing. Stop dev server, run: npx prisma generate, then restart." },
      { status: 503 }
    );
  }

  const discovered = await prisma.discoveredBonus.findUnique({
    where: { id },
    select: { status: true },
  });

  if (!discovered || discovered.status !== "pending") {
    return NextResponse.json(
      { error: "Not found or already processed" },
      { status: 404 }
    );
  }

  await prisma.discoveredBonus.update({
    where: { id },
    data: { status: "rejected", rejectedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
