import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params;

  const reviews = await prisma.productReview.findMany({
    where: { productId },
    include: {
      user: { select: { id: true, username: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reviews);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: productId } = await params;
  const body = await request.json();
  const { rating, headline, pros, cons, body: reviewBody } = body;

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be between 1 and 5" },
      { status: 400 }
    );
  }

  const review = await prisma.productReview.upsert({
    where: {
      productId_userId: { productId, userId: session.user.id },
    },
    create: {
      productId,
      userId: session.user.id,
      rating,
      headline: headline ?? null,
      pros: pros ?? null,
      cons: cons ?? null,
      body: reviewBody ?? null,
    },
    update: {
      rating,
      headline: headline ?? undefined,
      pros: pros ?? undefined,
      cons: cons ?? undefined,
      body: reviewBody ?? undefined,
    },
    include: {
      user: { select: { id: true, username: true } },
    },
  });

  return NextResponse.json(review);
}
