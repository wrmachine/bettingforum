interface TheVerdictProps {
  productName: string;
  verdict?: string | null;
}

const DEFAULT_VERDICT = (name: string) =>
  `${name} is a top-tier destination for crypto sports betting. It offers instant transactions, competitive odds, extensive market coverage, and a user-friendly interface that suits both newcomers and seasoned bettors. Despite limited fiat options and geo-restrictions, it remains one of the best crypto sportsbooks available in 2024.`;

export function TheVerdict({ productName, verdict }: TheVerdictProps) {
  const text = verdict ?? DEFAULT_VERDICT(productName);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
      <div className="px-8 py-6">
        <h2 className="text-xl font-semibold text-gray-900">The Verdict</h2>
        <p className="mt-4 leading-relaxed text-gray-600">{text}</p>
      </div>
    </section>
  );
}
