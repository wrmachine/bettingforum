import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/slug";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, titleOverride, intro, items } = body;

  if (!title) {
    return NextResponse.json(
      { error: "title is required" },
      { status: 400 }
    );
  }

  const slug = generateSlug(title);

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      type: "listicle",
      authorId: session.user.id,
      status: "published",
      listicle: {
        create: {
          titleOverride: titleOverride ?? null,
          intro: intro ?? null,
          ...(items?.length && {
            items: {
              create: items.map(
                (item: { productId: string; position: number; note?: string }) => ({
                  productId: item.productId,
                  position: item.position,
                  note: item.note,
                })
              ),
            },
          }),
        },
      },
    },
    include: {
      listicle: { include: { items: true } },
    },
  });

  return NextResponse.json(post);
}
