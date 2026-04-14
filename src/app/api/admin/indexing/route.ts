import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { BASE_URL } from "@/lib/seo";
import {
  submitUrlsInBatches,
  checkTaskStatus,
  getTaskLinks,
  buildPostUrl,
  getRapidIndexerSettings,
} from "@/lib/rapid-indexer";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "task_status") {
    const taskId = searchParams.get("task_id");
    if (!taskId) {
      return NextResponse.json({ error: "task_id required" }, { status: 400 });
    }
    const status = await checkTaskStatus(taskId);
    return NextResponse.json(status);
  }

  if (action === "task_links") {
    const taskId = searchParams.get("task_id");
    if (!taskId) {
      return NextResponse.json({ error: "task_id required" }, { status: 400 });
    }
    const links = await getTaskLinks(taskId);
    return NextResponse.json(links);
  }

  const posts = await prisma.post.findMany({
    where: { status: "published" },
    select: { slug: true, type: true, title: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const typeToPath: Record<string, string> = {
    product: "products",
    thread: "threads",
    listicle: "listicles",
    article: "articles",
    bonus: "bonuses",
  };

  const urls = posts
    .filter((p) => typeToPath[p.type])
    .map((p) => ({
      url: `${BASE_URL}/${typeToPath[p.type]}/${p.slug}`,
      type: p.type,
      title: p.title,
      createdAt: p.createdAt,
    }));

  const summary = {
    total: urls.length,
    byType: Object.fromEntries(
      Object.keys(typeToPath).map((t) => [t, urls.filter((u) => u.type === t).length])
    ),
  };

  return NextResponse.json({ urls, summary });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const settings = await getRapidIndexerSettings();
  if (!settings.enabled) {
    return NextResponse.json({ error: "Rapid Indexer is disabled. Enable it in settings first." }, { status: 400 });
  }
  if (!settings.apiKey) {
    return NextResponse.json({ error: "API key not configured. Set it in settings first." }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const action = body.action as string;

  if (action === "submit_all") {
    const types = (body.types as string[]) ?? ["product", "thread", "listicle", "article", "bonus"];
    const vip = body.vip === true;

    const posts = await prisma.post.findMany({
      where: { status: "published", type: { in: types } },
      select: { slug: true, type: true },
    });

    const urls = posts.map((p) => buildPostUrl(p.type, p.slug));

    if (urls.length === 0) {
      return NextResponse.json({ error: "No published posts found for selected types" }, { status: 400 });
    }

    const typeLabel = types.length === 5 ? "All" : types.join(", ");
    const { batches, totalSubmitted } = await submitUrlsInBatches(urls, {
      title: `${typeLabel} pages - ${new Date().toISOString().split("T")[0]}`,
      vip,
    });

    const taskIds = batches.filter((b) => b.task_id).map((b) => b.task_id);
    const errors = batches.filter((b) => !b.success).map((b) => b.error);

    return NextResponse.json({
      success: errors.length === 0,
      task_ids: taskIds,
      task_id: taskIds[0],
      submitted_count: totalSubmitted,
      batch_count: batches.length,
      batch_size: settings.batchSize,
      ...(errors.length > 0 && { errors }),
    });
  }

  if (action === "submit_urls") {
    const urls = body.urls as string[];
    const vip = body.vip === true;
    const title = (body.title as string) ?? undefined;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: "urls array required" }, { status: 400 });
    }

    const { batches, totalSubmitted } = await submitUrlsInBatches(urls, { title, vip });
    const taskIds = batches.filter((b) => b.task_id).map((b) => b.task_id);

    return NextResponse.json({
      success: batches.every((b) => b.success),
      task_ids: taskIds,
      task_id: taskIds[0],
      submitted_count: totalSubmitted,
      batch_count: batches.length,
    });
  }

  if (action === "submit_recent") {
    const hours = typeof body.hours === "number" ? body.hours : 24;
    const vip = body.vip === true;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const posts = await prisma.post.findMany({
      where: { status: "published", createdAt: { gte: since } },
      select: { slug: true, type: true },
    });

    const urls = posts.map((p) => buildPostUrl(p.type, p.slug));

    if (urls.length === 0) {
      return NextResponse.json({ error: `No posts published in the last ${hours}h` }, { status: 400 });
    }

    const { batches, totalSubmitted } = await submitUrlsInBatches(urls, {
      title: `Recent posts (${hours}h) - ${new Date().toISOString().split("T")[0]}`,
      vip,
    });

    const taskIds = batches.filter((b) => b.task_id).map((b) => b.task_id);

    return NextResponse.json({
      success: batches.every((b) => b.success),
      task_ids: taskIds,
      task_id: taskIds[0],
      submitted_count: totalSubmitted,
      batch_count: batches.length,
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
