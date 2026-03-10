import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Public API: returns redirect map for middleware. No auth required. */
export async function GET() {
  const items = await prisma.redirect.findMany({
    where: { enabled: true },
    select: { source: true, destination: true },
  });

  const redirects = items.map((r) => ({ from: r.source, to: r.destination }));

  return NextResponse.json({ redirects });
}
