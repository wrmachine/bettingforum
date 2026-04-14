import { NextRequest, NextResponse } from "next/server";
import { runAiBotsCron } from "@/lib/ai-bots-cron";

export async function GET(request: NextRequest) {
  const isLocal =
    process.env.NODE_ENV === "development" ||
    /localhost|127\.0\.0\.1/.test(process.env.NEXTAUTH_URL ?? "");
  const secret =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    request.headers.get("x-cron-secret");
  const expected = process.env.CRON_SECRET;
  if (!isLocal && (!expected || secret !== expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dryRun = request.nextUrl.searchParams.get("dryRun") === "1";
  const forceProactive = request.nextUrl.searchParams.get("force") === "1";

  try {
    const results = await runAiBotsCron({ dryRun, forceProactive });
    if (!results.ok && results.errors.length) {
      return NextResponse.json(
        results,
        { status: results.errors[0]?.includes("ANTHROPIC") ? 503 : 500 }
      );
    }
    return NextResponse.json(results);
  } catch (err) {
    console.error("AI bots cron error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Cron failed" },
      { status: 500 }
    );
  }
}
