import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const items = await prisma.pageMeta.findMany({ orderBy: { pathPattern: "asc" } });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { pathPattern, title, description, ogTitle, ogDescription, ogImage, twitterCard, noIndex, noFollow, canonical } =
    body;

  if (!pathPattern || typeof pathPattern !== "string") {
    return NextResponse.json({ error: "pathPattern required" }, { status: 400 });
  }

  const item = await prisma.pageMeta.upsert({
    where: { pathPattern },
    create: {
      pathPattern,
      title: title ?? null,
      description: description ?? null,
      ogTitle: ogTitle ?? null,
      ogDescription: ogDescription ?? null,
      ogImage: ogImage ?? null,
      twitterCard: twitterCard ?? null,
      noIndex: noIndex ?? false,
      noFollow: noFollow ?? false,
      canonical: canonical ?? null,
    },
    update: {
      title: title ?? undefined,
      description: description ?? undefined,
      ogTitle: ogTitle ?? undefined,
      ogDescription: ogDescription ?? undefined,
      ogImage: ogImage ?? undefined,
      twitterCard: twitterCard ?? undefined,
      noIndex: noIndex ?? undefined,
      noFollow: noFollow ?? undefined,
      canonical: canonical ?? undefined,
    },
  });

  return NextResponse.json(item);
}
