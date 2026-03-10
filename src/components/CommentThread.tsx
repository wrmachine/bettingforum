"use client";

import { useEffect, useState } from "react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/format";

interface Comment {
  id: string;
  body: string;
  user: { username: string; role?: string };
  createdAt: string;
  replies?: Comment[];
}

interface CommentThreadProps {
  postId: string;
  postSlug?: string;
  compact?: boolean;
  /** Section title override (default varies by compact mode) */
  title?: string;
  /** Placeholder for the comment textarea */
  placeholder?: string;
  /** Submit button text */
  submitLabel?: string;
}

export function CommentThread({
  postId,
  postSlug,
  compact,
  title,
  placeholder = "Add a comment...",
  submitLabel = "Post comment",
}: CommentThreadProps) {
  const slug = postSlug ?? postId;
  const { data: session, status } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetch(`/api/posts/${slug}/comments`)
      .then((r) => r.json())
      .then(setComments)
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    fetch(`/api/posts/${slug}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: newComment }),
    })
      .then((r) => r.json())
      .then(() => {
        setNewComment("");
        return fetch(`/api/posts/${slug}/comments`).then((r) => r.json());
      })
      .then(setComments);
  };

  if (loading) {
    return (
      <div className="py-8 text-center text-slate-500">
        Loading comments...
      </div>
    );
  }

  const addCommentBlock = (
    <>
      {status === "authenticated" ? (
        <form onSubmit={handleSubmit} className={compact ? "" : "mb-6"}>
          {compact ? (
            <>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button type="submit" className="sr-only">
                {submitLabel}
              </button>
            </>
          ) : (
            <>
              <RichTextEditor
                value={newComment}
                onChange={setNewComment}
                placeholder={placeholder}
                minHeight="6rem"
                allowMedia={false}
              />
              <button
                type="submit"
                className="mt-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
              >
                {submitLabel}
              </button>
            </>
          )}
        </form>
      ) : (
        <div
          className={
            compact
              ? "rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-center text-sm text-slate-500"
              : "mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-600"
          }
        >
          <Link href="/auth/sign-in" className="font-medium text-accent hover:underline">
            Log in
          </Link>{" "}
          to add a comment
        </div>
      )}
    </>
  );

  const commentsBlock = (
    <div className={compact ? "mb-4 space-y-4" : "space-y-4"}>
      {comments.length === 0 ? (
        !compact && (
          <p className="py-6 text-center text-sm text-slate-500">
            No comments yet. Be the first to reply.
          </p>
        )
      ) : (
        comments.map((c) => <CommentItem key={c.id} comment={c} />)
      )}
    </div>
  );

  return (
    <div className={compact ? "" : "mt-4"}>
      {compact ? (
        <>
          {commentsBlock}
          {addCommentBlock}
        </>
      ) : (
        <>
          {addCommentBlock}
          {commentsBlock}
        </>
      )}
    </div>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="flex gap-4 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
        {comment.user.username.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-slate-900">
            {comment.user.username}
          </span>
          {comment.user.role === "ai_bot" && (
            <span className="rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-600">
              AI
            </span>
          )}
          <span className="text-slate-400">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>
        <div className="mt-1 text-slate-700 prose prose-slate max-w-none prose-p:my-1 prose-p:leading-relaxed [&_a]:text-accent [&_a]:underline">
          {comment.body && /<[a-z][\s\S]*>/i.test(comment.body) ? (
            <div dangerouslySetInnerHTML={{ __html: comment.body }} />
          ) : (
            <p>{comment.body}</p>
          )}
        </div>
        {comment.replies?.length ? (
          <div className="mt-4 ml-4 border-l-2 border-slate-100 pl-4">
            {comment.replies.map((r) => (
              <CommentItem key={r.id} comment={r} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
