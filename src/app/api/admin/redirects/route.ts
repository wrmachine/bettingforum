import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const items = await prisma.redirect.findMany({
    orderBy: { source: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { source, destination, enabled } = body;

  if (!source || typeof source !== "string") {
    return NextResponse.json({ error: "source required" }, { status: 400 });
  }
  if (!destination || typeof destination !== "string") {
    return NextResponse.json({ error: "destination required" }, { status: 400 });
  }

  const normalizedSource = source.startsWith("/") ? source : `/${source}`;
  const normalizedDest = destination.startsWith("/") ? destination : `/${destination}`;

  const item = await prisma.redirect.create({
    data: {
      source: normalizedSource,
      destination: normalizedDest,
      enabled: enabled !== false,
    },
  });
  return NextResponse.json(item);
}
