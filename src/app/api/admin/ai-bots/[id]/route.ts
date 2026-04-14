import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { SPORT_DIGEST_REGISTRY } from "@/lib/sports-digest/registry";

const VALID_DIGEST_KEYS = new Set(SPORT_DIGEST_REGISTRY.map((r) => r.sportKey));

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { id } = await params;
  const profile = await prisma.aiBotProfile.findUnique({
    where: { id },
    include: { user: { select: { id: true, username: true, email: true } } },
  });
  if (!profile) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404 });
  }
  return NextResponse.json(profile);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { id } = await params;
  const profile = await prisma.aiBotProfile.findUnique({ where: { id } });
  if (!profile) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404 });
  }

  let body: {
    name?: string;
    systemPrompt?: string;
    threadTopics?: string[];
    allowedForums?: string[];
    maxResponsesPerHour?: number;
    maxResponsesPerDay?: number;
    enabled?: boolean;
    defaultForumSlug?: string | null;
    appendPartnerLinks?: boolean;
    digestSportKey?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = String(body.name).trim();
  if (body.systemPrompt !== undefined) data.systemPrompt = String(body.systemPrompt).trim();
  if (body.threadTopics !== undefined)
    data.threadTopics =
      body.threadTopics?.length ?
        JSON.stringify(body.threadTopics)
      : null;
  if (body.allowedForums !== undefined)
    data.allowedForums =
      body.allowedForums?.length ?
        JSON.stringify(body.allowedForums)
      : null;
  if (body.maxResponsesPerHour !== undefined)
    data.maxResponsesPerHour = Math.max(1, Math.min(100, Number(body.maxResponsesPerHour) || 10));
  if (body.maxResponsesPerDay !== undefined)
    data.maxResponsesPerDay = Math.max(1, Math.min(500, Number(body.maxResponsesPerDay) || 50));
  if (body.enabled !== undefined) data.enabled = Boolean(body.enabled);
  if (body.defaultForumSlug !== undefined) {
    const s = String(body.defaultForumSlug).trim();
    data.defaultForumSlug = s.length ? s : null;
  }
  if (body.appendPartnerLinks !== undefined)
    data.appendPartnerLinks = Boolean(body.appendPartnerLinks);
  if (body.digestSportKey !== undefined) {
    const raw = body.digestSportKey;
    if (raw === null || raw === "") {
      data.digestSportKey = null;
    } else {
      const key = String(raw).trim().toLowerCase() || null;
      if (key && !VALID_DIGEST_KEYS.has(key)) {
        return NextResponse.json(
          { error: `Invalid digest sport key: ${key}` },
          { status: 400 }
        );
      }
      data.digestSportKey = key;
    }
  }

  const updated = await prisma.aiBotProfile.update({
    where: { id },
    data,
    include: { user: { select: { id: true, username: true, email: true } } },
  });
  return NextResponse.json(updated);
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
  const profile = await prisma.aiBotProfile.findUnique({ where: { id } });
  if (!profile) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404 });
  }
  await prisma.aiBotProfile.update({
    where: { id },
    data: { enabled: false },
  });
  return NextResponse.json({ ok: true, message: "Bot disabled" });
}
