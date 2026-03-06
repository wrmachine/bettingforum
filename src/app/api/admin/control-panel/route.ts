import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const KEY_AI_SYSTEM_PROMPT = "controlPanel_aiCompleteSystemPrompt";
const KEY_LISTICLE_INTRO = "controlPanel_listicleIntroPrompt";
const KEY_LISTICLE_PICKS = "controlPanel_listiclePicksPrompt";
const KEY_LISTICLE_BODY = "controlPanel_listicleBodyPrompt";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const settings = await prisma.seoSettings.findMany({
    where: { key: { startsWith: "controlPanel_" } },
  });
  const map = Object.fromEntries(settings.map((s) => [s.key.replace("controlPanel_", ""), s.value]));

  return NextResponse.json({
    aiCompleteSystemPrompt: map.aiCompleteSystemPrompt ?? null,
    listicleIntroPrompt: map.listicleIntroPrompt ?? null,
    listiclePicksPrompt: map.listiclePicksPrompt ?? null,
    listicleBodyPrompt: map.listicleBodyPrompt ?? null,
    anthropicConfigured: !!process.env.ANTHROPIC_API_KEY,
  });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const upsertPrompt = async (key: string, value: string | null | undefined) => {
    if (value === undefined) return;
    const v = value != null ? String(value).trim() : "";
    await prisma.seoSettings.upsert({
      where: { key },
      create: { key, value: v },
      update: { value: v },
    });
  };

  await upsertPrompt(KEY_AI_SYSTEM_PROMPT, body.aiCompleteSystemPrompt);
  await upsertPrompt(KEY_LISTICLE_INTRO, body.listicleIntroPrompt);
  await upsertPrompt(KEY_LISTICLE_PICKS, body.listiclePicksPrompt);
  await upsertPrompt(KEY_LISTICLE_BODY, body.listicleBodyPrompt);

  const settings = await prisma.seoSettings.findMany({
    where: { key: { startsWith: "controlPanel_" } },
  });
  const map = Object.fromEntries(settings.map((s) => [s.key.replace("controlPanel_", ""), s.value]));

  return NextResponse.json({
    aiCompleteSystemPrompt: map.aiCompleteSystemPrompt ?? null,
    listicleIntroPrompt: map.listicleIntroPrompt ?? null,
    listiclePicksPrompt: map.listiclePicksPrompt ?? null,
    listicleBodyPrompt: map.listicleBodyPrompt ?? null,
    anthropicConfigured: !!process.env.ANTHROPIC_API_KEY,
  });
}
