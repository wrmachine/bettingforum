import { NextRequest, NextResponse } from "next/server";
import { runSportsDigestCron } from "@/lib/sports-digest-cron";

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
  const force = request.nextUrl.searchParams.get("force") === "1";

  try {
    const results = await runSportsDigestCron({ dryRun, force });
    if (!results.ok && results.errors.length) {
      return NextResponse.json(
        results,
        { status: results.errors[0]?.includes("ANTHROPIC") ? 503 : 500 }
      );
    }
    return NextResponse.json(results);
  } catch (err) {
    console.error("Sports digest cron error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Cron failed" },
      { status: 500 }
    );
  }
}
