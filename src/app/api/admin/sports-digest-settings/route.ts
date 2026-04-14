import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { getDigestState, setDigestState, type DigestState } from "@/lib/sports-digest/state";
import { SPORT_DIGEST_REGISTRY } from "@/lib/sports-digest/registry";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const state = await getDigestState();
  return NextResponse.json({
    state,
    registry: SPORT_DIGEST_REGISTRY.map((r) => ({
      sportKey: r.sportKey,
      forumSlug: r.forumSlug,
      displayName: r.displayName,
    })),
  });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: { state?: Partial<DigestState> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const current = await getDigestState();
  const next: DigestState = {
    enabled: { ...current.enabled, ...(body.state?.enabled ?? {}) },
    lastDigestDate: {
      ...current.lastDigestDate,
      ...(body.state?.lastDigestDate ?? {}),
    },
  };

  await setDigestState(next);
  return NextResponse.json({ ok: true, state: next });
}
