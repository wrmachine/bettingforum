import { prisma } from "@/lib/prisma";
import { createBotThread } from "@/lib/ai-bots";

export async function createDigestPost(
  botUserId: string,
  forumSlug: string,
  title: string,
  excerpt: string,
  body: string,
  tagSlug: string
): Promise<{ id: string; slug: string }> {
  const post = await createBotThread(botUserId, forumSlug, title, excerpt, body);
  const tag = await prisma.tag.findUnique({
    where: { slug: tagSlug },
    select: { id: true },
  });
  if (tag) {
    await prisma.postTag
      .create({
        data: { postId: post.id, tagId: tag.id },
      })
      .catch(() => {
        /* unique constraint if already tagged */
      });
  }
  return post;
}
