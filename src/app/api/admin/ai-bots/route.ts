import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { SPORT_DIGEST_REGISTRY } from "@/lib/sports-digest/registry";

const VALID_DIGEST_KEYS = new Set(SPORT_DIGEST_REGISTRY.map((r) => r.sportKey));

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const bots = await prisma.aiBotProfile.findMany({
    include: { user: { select: { id: true, username: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(bots);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: {
    username: string;
    email: string;
    name: string;
    systemPrompt: string;
    threadTopics?: string[];
    allowedForums?: string[];
    maxResponsesPerHour?: number;
    maxResponsesPerDay?: number;
    defaultForumSlug?: string | null;
    appendPartnerLinks?: boolean;
    digestSportKey?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const username = String(body.username || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const name = String(body.name || "").trim();
  const systemPrompt = String(body.systemPrompt || "").trim();

  if (!username || !email || !name || !systemPrompt) {
    return NextResponse.json(
      { error: "username, email, name, and systemPrompt are required" },
      { status: 400 }
    );
  }

  if (!email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });
  if (existingUser) {
    return NextResponse.json(
      { error: "Username or email already exists" },
      { status: 409 }
    );
  }

  try {
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: null,
        role: "ai_bot",
      },
    });

    const dSlug = String(body.defaultForumSlug ?? "").trim();
    let digestKey: string | null =
      body.digestSportKey != null && String(body.digestSportKey).trim() !== ""
        ? String(body.digestSportKey).trim().toLowerCase()
        : null;
    if (digestKey && !VALID_DIGEST_KEYS.has(digestKey)) {
      return NextResponse.json(
        { error: `Invalid digest sport key: ${digestKey}` },
        { status: 400 }
      );
    }

    const profile = await prisma.aiBotProfile.create({
      data: {
        userId: user.id,
        name,
        systemPrompt,
        threadTopics: body.threadTopics?.length
          ? JSON.stringify(body.threadTopics)
          : null,
        allowedForums: body.allowedForums?.length
          ? JSON.stringify(body.allowedForums)
          : null,
        maxResponsesPerHour: body.maxResponsesPerHour ?? 10,
        maxResponsesPerDay: body.maxResponsesPerDay ?? 50,
        defaultForumSlug: dSlug.length ? dSlug : null,
        appendPartnerLinks: body.appendPartnerLinks ?? true,
        digestSportKey: digestKey,
      },
      include: { user: { select: { id: true, username: true, email: true } } },
    });

    return NextResponse.json(profile);
  } catch (err) {
    console.error("Create AI bot error:", err);
    return NextResponse.json(
      { error: "Failed to create bot" },
      { status: 500 }
    );
  }
}
