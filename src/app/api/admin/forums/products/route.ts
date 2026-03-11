import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const products = await prisma.product.findMany({
    where: { post: { status: "published" } },
    select: {
      brandName: true,
      post: { select: { slug: true } },
    },
    orderBy: { brandName: "asc" },
  });

  return NextResponse.json(
    products.map((p) => ({ slug: p.post.slug, brandName: p.brandName }))
  );
}
