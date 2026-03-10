import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const logs = await prisma.aiBotActivityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const postIds = [...new Set(logs.map((l) => l.postId).filter(Boolean))] as string[];
  const posts = await prisma.post.findMany({
    where: { id: { in: postIds } },
    select: { id: true, slug: true },
  });
  const slugByPostId = Object.fromEntries(posts.map((p) => [p.id, p.slug]));

  const enriched = logs.map((log) => ({
    ...log,
    postSlug: log.postId ? slugByPostId[log.postId] : null,
  }));

  return NextResponse.json(enriched);
}
