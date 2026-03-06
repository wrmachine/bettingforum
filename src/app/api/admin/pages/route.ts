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

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const items = await prisma.staticPage.findMany({ orderBy: { slug: "asc" } });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { slug, title, body: pageBody } = body;

  const normalizedSlug = (slug ?? "").toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/(^-|-$)/g, "");

  if (!normalizedSlug) {
    return NextResponse.json({ error: "Slug required" }, { status: 400 });
  }
  if (SLUG_BLOCKLIST.includes(normalizedSlug)) {
    return NextResponse.json({ error: `Slug "${normalizedSlug}" is reserved` }, { status: 400 });
  }
  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  const existing = await prisma.staticPage.findUnique({ where: { slug: normalizedSlug } });
  if (existing) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
  }

  const item = await prisma.staticPage.create({
    data: {
      slug: normalizedSlug,
      title,
      body: typeof pageBody === "string" ? pageBody : "",
    },
  });

  return NextResponse.json(item);
}
