import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

/** POST /api/admin/redirects/bulk - Add multiple redirects at once (e.g. paste from export) */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { redirects } = body as { redirects: Array<{ from: string; to: string }> };

  if (!Array.isArray(redirects) || redirects.length === 0) {
    return NextResponse.json({ error: "redirects array required (from, to)" }, { status: 400 });
  }

  const created: { source: string; destination: string }[] = [];
  const errors: { index: number; from: string; to: string; error: string }[] = [];

  for (let i = 0; i < redirects.length; i++) {
    const r = redirects[i];
    const from = typeof r?.from === "string" ? (r.from.startsWith("/") ? r.from : `/${r.from}`) : "";
    const to = typeof r?.to === "string" ? (r.to.startsWith("/") ? r.to : `/${r.to}`) : "";

    if (!from || !to) {
      errors.push({ index: i, from: String(r?.from ?? ""), to: String(r?.to ?? ""), error: "from and to required" });
      continue;
    }

    try {
      await prisma.redirect.create({
        data: { source: from, destination: to, enabled: true },
      });
      created.push({ source: from, destination: to });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push({ index: i, from, to, error: msg });
    }
  }

  return NextResponse.json({ created: created.length, errors });
}
