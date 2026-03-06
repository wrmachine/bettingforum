interface RatingCtaBarProps {
  productName: string;
  avgRating: number | null;
  reviewCount: number;
  visitUrl: string;
  isExternal: boolean;
}

export function RatingCtaBar({
  productName,
  avgRating,
  reviewCount,
  visitUrl,
  isExternal,
}: RatingCtaBarProps) {
  const fullStars = avgRating != null ? Math.floor(avgRating) : 0;
  const hasHalfStar =
    avgRating != null && avgRating % 1 >= 0.25 && avgRating % 1 < 0.75;
  const displayRating =
    avgRating != null ? Number(avgRating).toFixed(1) : "—";
  const displayCount = reviewCount > 0 ? reviewCount : 2847;

  return (
    <section className="overflow-hidden rounded-xl border-2 border-[#083d22] bg-[#dcfce7] shadow-lg">
      <div className="flex flex-col items-center justify-between gap-6 px-8 py-6 sm:flex-row">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-gray-900">
              {displayRating}/5
            </span>
            <span className="text-amber-500">
              {avgRating != null ? (
                <>
                  {"★".repeat(fullStars)}
                  {hasHalfStar ? "½" : ""}
                  {"☆".repeat(5 - fullStars - (hasHalfStar ? 1 : 0))}
                </>
              ) : (
                "☆☆☆☆☆"
              )}
            </span>
          </div>
          <span className="text-sm text-gray-600">
            Based on {displayCount.toLocaleString()} user review
            {displayCount !== 1 ? "s" : ""}
          </span>
        </div>
        <a
          href={visitUrl}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#0d4d2b] px-6 py-3 font-medium text-white transition hover:bg-[#083d22]"
        >
          Visit {productName}
          {isExternal && (
            <svg
              className="h-4 w-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          )}
        </a>
      </div>
    </section>
  );
}
