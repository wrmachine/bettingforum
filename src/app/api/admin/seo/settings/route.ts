import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const settings = await prisma.seoSettings.findMany();
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  return NextResponse.json(map);
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const keys = [
    "siteName",
    "defaultTitle",
    "defaultDescription",
    "defaultOgImage",
    "twitterHandle",
    "robotsAllow",
    "robotsDisallowPaths",
  ];

  for (const key of keys) {
    if (body[key] !== undefined) {
      const value =
        typeof body[key] === "object" ? JSON.stringify(body[key]) : String(body[key]);
      await prisma.seoSettings.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      });
    }
  }

  const settings = await prisma.seoSettings.findMany();
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  return NextResponse.json(map);
}
