interface ProsConsProps {
  pros?: string[];
  cons?: string[];
}

const DEFAULT_PROS = [
  "Instant crypto deposits and withdrawals",
  "No KYC required for crypto users",
  "Wide range of sports markets",
  "Competitive odds on major leagues",
  "24/7 live chat support",
];

const DEFAULT_CONS = [
  "Limited fiat payment options",
  "Restricted in some countries",
  "No phone support available",
];

export function ProsCons({ pros = DEFAULT_PROS, cons = DEFAULT_CONS }: ProsConsProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
      <div className="px-8 py-6">
        <h2 className="text-xl font-semibold text-gray-900">Pros & Cons</h2>
        <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-emerald-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Pros
            </h3>
            <ul className="space-y-3">
              {pros.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <svg
                    className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-red-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              Cons
            </h3>
            <ul className="space-y-3">
              {cons.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <svg
                    className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
