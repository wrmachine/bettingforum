import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const items = await prisma.schemaConfig.findMany({ orderBy: { schemaType: "asc" } });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { schemaType, enabled, config } = body;

  if (!schemaType || typeof schemaType !== "string") {
    return NextResponse.json({ error: "schemaType required" }, { status: 400 });
  }

  const item = await prisma.schemaConfig.upsert({
    where: { schemaType },
    create: {
      schemaType,
      enabled: enabled !== false,
      config: typeof config === "string" ? config : JSON.stringify(config ?? {}),
    },
    update: {
      enabled: enabled !== undefined ? enabled : undefined,
      config: config !== undefined ? (typeof config === "string" ? config : JSON.stringify(config)) : undefined,
    },
  });

  return NextResponse.json(item);
}
