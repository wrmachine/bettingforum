import { prisma } from "./prisma";

export async function resolvePostId(slugOrId: string): Promise<string | null> {
  const bySlug = await prisma.post.findUnique({
    where: { slug: slugOrId },
    select: { id: true },
  });
  if (bySlug) return bySlug.id;

  const byId = await prisma.post.findUnique({
    where: { id: slugOrId },
    select: { id: true },
  });
  return byId?.id ?? null;
}
