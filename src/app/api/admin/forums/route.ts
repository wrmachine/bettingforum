import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { FORUM_CONFIGS, getForumsWithOverrides } from "@/lib/forums";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const forums = await getForumsWithOverrides();
  return NextResponse.json(forums);
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { slug, name, description } = body;

  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  const exists = FORUM_CONFIGS.some((f) => f.slug === slug);
  if (!exists) {
    return NextResponse.json({ error: "Unknown forum slug" }, { status: 400 });
  }

  const nameVal = name != null ? String(name).trim() || null : null;
  const descVal = description != null ? String(description).trim() || null : null;

  if (nameVal === null && descVal === null) {
    await prisma.forumMeta.deleteMany({ where: { slug } });
  } else {
    await prisma.forumMeta.upsert({
      where: { slug },
      create: { slug, name: nameVal, description: descVal },
      update: { name: nameVal, description: descVal },
    });
  }

  const forums = await getForumsWithOverrides();
  return NextResponse.json(forums);
}
