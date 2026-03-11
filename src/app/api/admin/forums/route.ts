import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { FORUM_CONFIGS, getForumsWithOverrides } from "@/lib/forums";

const VALID_ICONS = [
  "globe", "chart", "question", "hand", "gift", "sportsbook", "casino",
  "crypto", "tool", "bonus", "article", "nfl", "nba", "mlb", "nhl",
  "soccer", "mma", "tennis", "golf", "boxing", "esports",
];
const VALID_CATEGORIES = ["topic", "product", "bonus", "sports", "content"];
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const forums = await getForumsWithOverrides();
  return NextResponse.json(forums);
}

/** Update name/description override for an existing (code-defined or custom) forum. */
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

  const isCodeForum = FORUM_CONFIGS.some((f) => f.slug === slug);
  const dbRow = await prisma.forumMeta.findUnique({ where: { slug } });

  if (!isCodeForum && !dbRow?.isCustom) {
    return NextResponse.json({ error: "Unknown forum slug" }, { status: 400 });
  }

  const nameVal = name != null ? String(name).trim() || null : null;
  const descVal = description != null ? String(description).trim() || null : null;

  if (isCodeForum && !dbRow?.isCustom) {
    if (nameVal === null && descVal === null) {
      await prisma.forumMeta.deleteMany({ where: { slug } });
    } else {
      await prisma.forumMeta.upsert({
        where: { slug },
        create: { slug, name: nameVal, description: descVal },
        update: { name: nameVal, description: descVal },
      });
    }
  } else {
    await prisma.forumMeta.update({
      where: { slug },
      data: { name: nameVal, description: descVal },
    });
  }

  const forums = await getForumsWithOverrides();
  return NextResponse.json(forums);
}

/** Create a new custom forum. */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { slug, name, description, icon, category, type, productType, productSlug, tag } = body;

  if (!slug || typeof slug !== "string" || !SLUG_RE.test(slug)) {
    return NextResponse.json(
      { error: "slug is required and must be lowercase alphanumeric with hyphens (e.g. bet-picks)" },
      { status: 400 }
    );
  }
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (icon && !VALID_ICONS.includes(icon)) {
    return NextResponse.json({ error: `Invalid icon. Valid: ${VALID_ICONS.join(", ")}` }, { status: 400 });
  }
  if (category && !VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: `Invalid category. Valid: ${VALID_CATEGORIES.join(", ")}` }, { status: 400 });
  }

  const existsInCode = FORUM_CONFIGS.some((f) => f.slug === slug);
  const existsInDb = await prisma.forumMeta.findUnique({ where: { slug } });
  if (existsInCode || existsInDb?.isCustom) {
    return NextResponse.json({ error: "A forum with this slug already exists" }, { status: 409 });
  }

  await prisma.forumMeta.create({
    data: {
      slug,
      name: String(name).trim(),
      description: description ? String(description).trim() : null,
      icon: icon || "globe",
      category: category || "topic",
      type: type || "thread",
      productType: productType || null,
      productSlug: productSlug || null,
      tag: tag || null,
      isCustom: true,
    },
  });

  const forums = await getForumsWithOverrides();
  return NextResponse.json(forums, { status: 201 });
}

/** Delete a custom forum. Code-defined forums cannot be deleted. */
export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "slug query param required" }, { status: 400 });
  }

  const row = await prisma.forumMeta.findUnique({ where: { slug } });
  if (!row || !row.isCustom) {
    return NextResponse.json({ error: "Only custom forums can be deleted" }, { status: 400 });
  }

  await prisma.forumMeta.delete({ where: { slug } });

  const forums = await getForumsWithOverrides();
  return NextResponse.json(forums);
}
