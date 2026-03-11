import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const prefix = searchParams.get("prefix");

  const where = prefix ? { key: { startsWith: prefix } } : {};
  const items = await prisma.siteContent.findMany({
    where,
    orderBy: { key: "asc" },
  });

  const data: Record<string, string> = {};
  for (const item of items) {
    data[item.key] = item.value;
  }

  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Body must be a JSON object" }, { status: 400 });
  }

  const entries = Object.entries(body) as [string, string][];
  if (entries.length === 0) {
    return NextResponse.json({ error: "No entries provided" }, { status: 400 });
  }

  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.siteContent.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
