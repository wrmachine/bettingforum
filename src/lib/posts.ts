import { prisma } from "./prisma";
import { sumVotes } from "./vote-sum";

type PostCardShape = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  type: "product" | "listicle" | "thread" | "article";
  votes: number;
  comments: number;
  tags: string[];
  logoUrl: string | null;
};

/** Extended shape for feed: includes article-specific fields for ArticleCard */
export type FeedPostShape = PostCardShape & {
  author?: string;
  createdAt?: string;
  featuredImageUrl?: string | null;
};

function mapPostToCard(p: {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  type: string;
  votes: { value: number }[];
  _count: { comments: number };
  postTags: { tag: { name: string } }[];
}): PostCardShape {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt ?? "",
    type: p.type as PostCardShape["type"],
    votes: sumVotes(p.votes),
    comments: p._count.comments,
    tags: p.postTags.map((pt) => pt.tag.name),
    logoUrl: null,
  };
}

const threadInclude = {
  author: { select: { username: true } },
  votes: { select: { value: true } },
  _count: { select: { comments: true } },
  postTags: { include: { tag: true } },
} as const;

const feedInclude = {
  ...threadInclude,
  article: { select: { featuredImageUrl: true } },
} as const;

function mapPostToFeedCard(p: {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  type: string;
  createdAt: Date;
  votes: { value: number }[];
  _count: { comments: number };
  postTags: { tag: { name: string } }[];
  author: { username: string };
  article?: { featuredImageUrl: string | null } | null;
}): FeedPostShape {
  const base = mapPostToCard(p);
  return {
    ...base,
    author: p.author.username,
    createdAt: p.createdAt.toISOString(),
    ...(p.type === "article" && p.article && {
      featuredImageUrl: p.article.featuredImageUrl,
    }),
  };
}

/** Admin-promoted threads (pinned on home), max 3 */
export async function getPromotedThreads(limit = 3): Promise<PostCardShape[]> {
  try {
    const posts = await prisma.post.findMany({
      where: { type: "thread", status: "published", promoted: true },
      include: threadInclude,
      orderBy: { createdAt: "desc" as const },
      take: limit,
    });
    return posts.map(mapPostToCard);
  } catch {
    return [];
  }
}

/** Threads sorted by vote count (popular) */
export async function getPopularThreads(limit = 9): Promise<PostCardShape[]> {
  try {
    const posts = await prisma.post.findMany({
      where: { type: "thread", status: "published" },
      include: threadInclude,
      orderBy: { createdAt: "desc" as const },
      take: 100,
    });
    posts.sort((a, b) => sumVotes(b.votes) - sumVotes(a.votes));
    return posts.slice(0, limit).map(mapPostToCard);
  } catch {
    return [];
  }
}

/** Threads and articles sorted by vote count (popular) */
export async function getPopularPosts(limit = 4): Promise<FeedPostShape[]> {
  try {
    const posts = await prisma.post.findMany({
      where: {
        type: { in: ["thread", "article"] },
        status: "published",
      },
      include: feedInclude,
      orderBy: { createdAt: "desc" as const },
      take: 100,
    });
    posts.sort((a, b) => sumVotes(b.votes) - sumVotes(a.votes));
    return posts.slice(0, limit).map(mapPostToFeedCard);
  } catch {
    return [];
  }
}

/** Threads sorted by newest first */
export async function getLatestThreads(limit = 9): Promise<PostCardShape[]> {
  try {
    const posts = await prisma.post.findMany({
      where: { type: "thread", status: "published" },
      include: threadInclude,
      orderBy: { createdAt: "desc" as const },
      take: limit,
    });
    return posts.map(mapPostToCard);
  } catch {
    return [];
  }
}

/** Single most recent article */
export async function getLatestArticle(): Promise<FeedPostShape | null> {
  try {
    const post = await prisma.post.findFirst({
      where: { type: "article", status: "published" },
      include: feedInclude,
      orderBy: { createdAt: "desc" as const },
    });
    return post ? mapPostToFeedCard(post) : null;
  } catch {
    return null;
  }
}

/** Threads and articles mixed, sorted by newest first */
export async function getLatestPosts(limit = 15): Promise<FeedPostShape[]> {
  try {
    const posts = await prisma.post.findMany({
      where: {
        type: { in: ["thread", "article"] },
        status: "published",
      },
      include: feedInclude,
      orderBy: { createdAt: "desc" as const },
      take: limit,
    });
    return posts.map(mapPostToFeedCard);
  } catch {
    return [];
  }
}

export async function getPostsByType(type: string, limit = 9): Promise<PostCardShape[]> {
  try {
    const posts = await prisma.post.findMany({
      where: { type, status: "published" },
      include: {
        author: { select: { username: true } },
        votes: { select: { value: true } },
        _count: { select: { comments: true } },
        postTags: { include: { tag: true } },
      },
      orderBy: { createdAt: "desc" as const },
      take: 100,
    });
    posts.sort((a, b) => sumVotes(b.votes) - sumVotes(a.votes));
    const limited = posts.slice(0, limit);

    return limited.map(mapPostToCard);
  } catch {
    return [];
  }
}
