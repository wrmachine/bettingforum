import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const SLUG_BLOCKLIST = [
  "admin",
  "auth",
  "api",
  "u",
  "products",
  "threads",
  "articles",
  "listicles",
  "account",
  "submit",
  "responsible",
  "categories",
  "search",
];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const item = await prisma.staticPage.findUnique({ where: { id } });
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(item);
}

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
  const { slug, title, body: pageBody } = body;

  const existing = await prisma.staticPage.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updates: { slug?: string; title?: string; body?: string } = {};

  if (slug !== undefined) {
    const normalizedSlug = String(slug).toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/(^-|-$)/g, "");
    if (!normalizedSlug) {
      return NextResponse.json({ error: "Slug cannot be empty" }, { status: 400 });
    }
    if (SLUG_BLOCKLIST.includes(normalizedSlug)) {
      return NextResponse.json({ error: `Slug "${normalizedSlug}" is reserved` }, { status: 400 });
    }
    const conflict = await prisma.staticPage.findFirst({
      where: { slug: normalizedSlug, id: { not: id } },
    });
    if (conflict) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }
    updates.slug = normalizedSlug;
  }

  if (title !== undefined) {
    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Title required" }, { status: 400 });
    }
    updates.title = title;
  }

  if (pageBody !== undefined) {
    updates.body = typeof pageBody === "string" ? pageBody : "";
  }

  const item = await prisma.staticPage.update({
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
  await prisma.staticPage.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
