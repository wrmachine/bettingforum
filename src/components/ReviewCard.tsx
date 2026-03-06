"use client";

import { useEffect, useState } from "react";

interface Review {
  id: string;
  rating: number;
  headline: string | null;
  pros: string | null;
  cons: string | null;
  body: string | null;
  user: { username: string };
  createdAt: string;
}

interface ReviewCardProps {
  productId?: string;
  postId: string;
}

function ThumbsUpIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
      />
    </svg>
  );
}

function ReplyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

export function ReviewCard({ productId, postId }: ReviewCardProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }
    fetch(`/api/products/${productId}/reviews`)
      .then((r) => r.json())
      .then(setReviews)
      .finally(() => setLoading(false));
  }, [productId]);

  if (!productId) return null;
  if (loading) return <p className="mt-4 text-gray-500">Loading reviews...</p>;

  return (
    <div className="mt-6 space-y-0 divide-y divide-slate-100">
      {reviews.length === 0 ? (
        <p className="py-8 text-center text-gray-500">
          No reviews yet. Be the first to review!
        </p>
      ) : (
        reviews.map((r) => {
          const initial = r.user.username.charAt(0).toUpperCase();
          const dateStr = new Date(r.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          const bodyParts = [r.body];
          if (r.pros) bodyParts.push(`Pros: ${r.pros}`);
          if (r.cons) bodyParts.push(`Cons: ${r.cons}`);
          const bodyText = bodyParts.filter(Boolean).join(" ");
          const helpfulCount = 0;

          return (
            <div
              key={r.id}
              className="py-6 first:pt-4 last:pb-0"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-base font-semibold text-gray-700">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {r.user.username}
                      </p>
                      <p className="text-sm text-gray-500">{dateStr}</p>
                    </div>
                    <div className="mt-1 text-amber-500 sm:mt-0">
                      {"★".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
                    </div>
                  </div>
                  {r.headline && (
                    <h3 className="mt-3 font-semibold text-gray-900">
                      {r.headline}
                    </h3>
                  )}
                  {bodyText && (
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {bodyText}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                    <button
                      type="button"
                      className="flex items-center gap-1.5 hover:text-gray-700"
                    >
                      <ThumbsUpIcon className="h-4 w-4" />
                      Helpful ({helpfulCount})
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 hover:text-gray-700"
                    >
                      <ReplyIcon className="h-4 w-4" />
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
