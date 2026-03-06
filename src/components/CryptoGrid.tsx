"use client";

import {
  parseCryptoMethods,
  CRYPTO_OPTIONS,
  type CryptoMethodEntry,
} from "@/lib/product-options";

interface CryptoGridProps {
  cryptoMethodsJson: string | null;
  /** When true and no methods: show "Cryptocurrency supported"; when false and no methods: show "No" or hide */
  cryptoSupported?: boolean;
}

function CryptoCard({
  entry,
  option,
}: {
  entry: CryptoMethodEntry;
  option: { name: string; symbol: string; color?: string };
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
      style={{ borderLeftWidth: 4, borderLeftColor: option.color ?? "#94a3b8" }}
    >
      <span
        className="text-lg font-bold"
        style={{ color: option.color ?? "#475569" }}
      >
        {option.symbol}
      </span>
      <span className="text-sm font-medium text-slate-700">{option.name}</span>
    </div>
  );
}

export function CryptoGrid({
  cryptoMethodsJson,
  cryptoSupported = false,
}: CryptoGridProps) {
  const methods = parseCryptoMethods(cryptoMethodsJson);

  if (methods.length === 0) {
    if (!cryptoSupported) return null;
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Cryptocurrency</h2>
        <p className="text-slate-600">Cryptocurrency supported.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Cryptocurrency</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {methods.map((entry) => {
          const option =
            CRYPTO_OPTIONS[entry.id.toLowerCase()] ??
            CRYPTO_OPTIONS[entry.id.replace("-", "_")] ?? {
              name: entry.name ?? entry.id,
              symbol: entry.id.slice(0, 4).toUpperCase(),
            };
          return (
            <CryptoCard
              key={entry.id}
              entry={entry}
              option={option}
            />
          );
        })}
      </div>
    </section>
  );
}
