import { prisma } from "@/lib/prisma";
import { sumVotes } from "@/lib/vote-sum";

/**
 * Fetch a published post by slug directly from the database.
 * Replaces the self-fetch anti-pattern (fetching own API route during SSR)
 * which causes 5xx errors when Googlebot crawls pages.
 */
export async function getPostBySlug(slug: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { slug, status: "published" },
      include: {
        author: {
          select: { id: true, username: true, role: true, avatarUrl: true },
        },
        product: {
          include: {
            reviews: { select: { rating: true } },
          },
        },
        listicle: {
          include: {
            items: {
              include: {
                product: {
                  include: {
                    post: true,
                    bonuses: {
                      select: { promoCode: true, featured: true },
                      orderBy: { featured: "desc" },
                    },
                    reviews: { select: { rating: true } },
                  },
                },
              },
              orderBy: { position: "asc" },
            },
          },
        },
        article: true,
        bonus: {
          include: {
            product: {
              select: {
                id: true,
                brandName: true,
                siteUrl: true,
                logoUrl: true,
                post: { select: { slug: true } },
              },
            },
          },
        },
        votes: { select: { value: true } },
        _count: { select: { comments: true } },
        postTags: { include: { tag: true } },
      },
    });

    if (!post) return null;

    const data = {
      ...post,
      votes: sumVotes(post.votes),
      comments: post._count.comments,
      tags: post.postTags.map((pt) => pt.tag),
      _count: undefined,
      postTags: undefined,
    };

    // Serialize to plain JSON to match the shape client components expect
    // (Date objects become ISO strings, matching the old API response format)
    return JSON.parse(JSON.stringify(data));
  } catch (err) {
    console.error("getPostBySlug error:", err);
    return null;
  }
}
