import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { runAiBotsCron } from "@/lib/ai-bots-cron";
import { runSportsDigestCron } from "@/lib/sports-digest-cron";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: {
    job?: string;
    dryRun?: boolean;
    force?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const job = String(body.job || "");
  if (job === "ai-bots") {
    const results = await runAiBotsCron({
      dryRun: !!body.dryRun,
      forceProactive: !!body.force,
    });
    return NextResponse.json(results);
  }
  if (job === "sports-digest") {
    const results = await runSportsDigestCron({
      dryRun: !!body.dryRun,
      force: !!body.force,
    });
    return NextResponse.json(results);
  }

  return NextResponse.json(
    { error: 'Unknown job. Use "ai-bots" or "sports-digest".' },
    { status: 400 }
  );
}
