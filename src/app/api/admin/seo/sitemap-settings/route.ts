import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const items = await prisma.sitemapConfig.findMany({ orderBy: { pathPattern: "asc" } });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { pathPattern, priority, changeFreq, enabled } = body;

  if (!pathPattern || typeof pathPattern !== "string") {
    return NextResponse.json({ error: "pathPattern required" }, { status: 400 });
  }

  const validFreq = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"];
  const freq = validFreq.includes(changeFreq) ? changeFreq : "weekly";
  const prio = typeof priority === "number" ? Math.min(1, Math.max(0, priority)) : 0.5;

  const item = await prisma.sitemapConfig.upsert({
    where: { pathPattern },
    create: {
      pathPattern,
      priority: prio,
      changeFreq: freq,
      enabled: enabled !== false,
    },
    update: {
      priority: prio,
      changeFreq: freq,
      enabled: enabled !== false,
    },
  });

  return NextResponse.json(item);
}
