import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolvePostId } from "@/lib/post-resolve";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getVoteSum(postId: string): Promise<number> {
  const result = await prisma.vote.aggregate({
    where: { postId },
    _sum: { value: true },
  });
  return result._sum.value ?? 0;
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

  let body: { direction?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const direction = (body.direction ?? "up").toLowerCase();
  const value = direction === "down" ? -1 : 1;

  const existing = await prisma.vote.findUnique({
    where: {
      postId_userId: { postId, userId: session.user.id },
    },
  });

  if (existing) {
    if (existing.value === value) {
      await prisma.vote.delete({ where: { id: existing.id } });
    } else {
      await prisma.vote.update({
        where: { id: existing.id },
        data: { value },
      });
    }
  } else {
    await prisma.vote.create({
      data: {
        postId,
        userId: session.user.id,
        value,
      },
    });
  }

  const votes = await getVoteSum(postId);
  return NextResponse.json({ votes });
}
