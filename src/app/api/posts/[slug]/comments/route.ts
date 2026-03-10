import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolvePostId } from "@/lib/post-resolve";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const postId = await resolvePostId(slug);
  if (!postId) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const comments = await prisma.comment.findMany({
    where: { postId, parentId: null },
    include: {
      user: { select: { id: true, username: true, role: true } },
      replies: {
        include: {
          user: { select: { id: true, username: true, role: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(comments);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const postId = await resolvePostId(slug);
  if (!postId) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const body = await request.json();
  const { body: commentBody, parentId } = body;

  if (!commentBody?.trim()) {
    return NextResponse.json(
      { error: "Comment body is required" },
      { status: 400 }
    );
  }

  const comment = await prisma.comment.create({
    data: {
      postId,
      userId: session.user.id,
      parentId: parentId || null,
      body: commentBody.trim(),
    },
    include: {
      user: { select: { id: true, username: true, role: true } },
    },
  });

  return NextResponse.json(comment);
}
