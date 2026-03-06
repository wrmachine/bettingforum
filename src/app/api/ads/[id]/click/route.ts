import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const ad = await prisma.ad.findUnique({
    where: { id },
    select: { linkUrl: true },
  });

  if (!ad) {
    return NextResponse.redirect(new URL("/", process.env.NEXTAUTH_URL ?? "http://localhost:3000"));
  }

  const referrer = _request.headers.get("referer") ?? undefined;

  await prisma.$transaction([
    prisma.ad.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    }),
    prisma.adClick.create({
      data: { adId: id, referrer },
    }),
  ]);

  return NextResponse.redirect(ad.linkUrl);
}
