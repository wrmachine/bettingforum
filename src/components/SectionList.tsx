import { PostCard, type PostCardProps } from "./PostCard";
import { ArticleCard } from "./ArticleCard";
import type { FeedPostShape } from "@/lib/posts";

interface SectionListProps {
  popularPosts: FeedPostShape[];
  latestArticle: FeedPostShape | null;
  latestPosts: FeedPostShape[];
}

function FeedItem({ post }: { post: FeedPostShape }) {
  if (post.type === "article" && post.author && post.createdAt) {
    return (
      <ArticleCard
        article={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || null,
          author: post.author,
          votes: post.votes,
          comments: post.comments,
          tags: post.tags,
          createdAt: post.createdAt,
          featuredImageUrl: post.featuredImageUrl ?? null,
        }}
      />
    );
  }
  return <PostCard key={post.id} post={post as PostCardProps["post"]} />;
}

export function SectionList({
  popularPosts,
  latestArticle,
  latestPosts,
}: SectionListProps) {
  const topIds = new Set([
    ...(latestArticle ? [latestArticle.id] : []),
    ...popularPosts.map((p) => p.id),
  ]);
  const rest = latestPosts.filter((p) => !topIds.has(p.id));
  const feed = [
    ...(latestArticle ? [latestArticle] : []),
    ...popularPosts,
    ...rest,
  ];

  return (
    <div className="flex flex-col gap-4">
      {feed.length === 0 ? (
        <p className="text-slate-500">No posts yet.</p>
      ) : (
        feed.map((post) => <FeedItem key={post.id} post={post} />)
      )}
    </div>
  );
}
