import { prisma } from "./prisma";
import { sumVotes } from "./vote-sum";

export type UserProfile = {
  id: string;
  username: string;
  role: string;
  createdAt: Date;
  stats: {
    posts: number;
    threads: number;
    comments: number;
    reviews: number;
    votesGiven: number;
  };
  recentPosts: {
    id: string;
    title: string;
    slug: string;
    type: string;
    votes: number;
    comments: number;
    createdAt: Date;
  }[];
  recentComments: {
    id: string;
    body: string;
    postId: string;
    postTitle: string;
    postSlug: string;
    postType: string;
    createdAt: Date;
  }[];
};

export async function getUserProfileByUsername(
  username: string
): Promise<UserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          comments: true,
          votes: true,
          productReviews: true,
        },
      },
    },
  });

  if (!user) return null;

  const [threads, recentPosts, recentComments] = await Promise.all([
    prisma.post.count({
      where: { authorId: user.id, type: "thread", status: "published" },
    }),
    prisma.post.findMany({
      where: { authorId: user.id, status: "published" },
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        createdAt: true,
        votes: { select: { value: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.comment.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        body: true,
        postId: true,
        createdAt: true,
        post: {
          select: {
            title: true,
            slug: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const posts = user._count.posts;
  const threadsCount = threads;

  return {
    id: user.id,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt,
    stats: {
      posts,
      threads: threadsCount,
      comments: user._count.comments,
      reviews: user._count.productReviews,
      votesGiven: user._count.votes,
    },
    recentPosts: recentPosts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      type: p.type,
      votes: sumVotes(p.votes),
      comments: p._count.comments,
      createdAt: p.createdAt,
    })),
    recentComments: recentComments.map((c) => ({
      id: c.id,
      body: c.body,
      postId: c.postId,
      postTitle: c.post.title,
      postSlug: c.post.slug,
      postType: c.post.type,
      createdAt: c.createdAt,
    })),
  };
}
