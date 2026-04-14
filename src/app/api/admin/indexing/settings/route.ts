import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import {
  getRapidIndexerSettings,
  saveRapidIndexerSettings,
} from "@/lib/rapid-indexer";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const settings = await getRapidIndexerSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const updated = await saveRapidIndexerSettings({
    enabled: typeof body.enabled === "boolean" ? body.enabled : undefined,
    apiKey: typeof body.apiKey === "string" ? body.apiKey : undefined,
    batchSize: typeof body.batchSize === "number" ? body.batchSize : undefined,
    autoSubmit: typeof body.autoSubmit === "boolean" ? body.autoSubmit : undefined,
  });

  return NextResponse.json(updated);
}
