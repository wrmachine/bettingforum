"use client";

import {
  parseCryptoMethods,
  CRYPTO_OPTIONS,
} from "@/lib/product-options";
import { parseProductTypes, formatProductTypesDisplay } from "@/lib/product-types";

interface QuickInfoPaymentMethodsProps {
  minDeposit?: string | null;
  licenseJurisdiction?: string | null;
  geoRestrictions?: string | null;
  withdrawalTime?: string | null;
  establishedYear?: string | null;
  cryptoMethodsJson?: string | null;
  cryptoSupported?: boolean;
  productType?: string | null;
}

const DUMMY_CRYPTO_IDS = ["bitcoin", "ethereum", "litecoin", "usdt", "dogecoin"];

export function QuickInfoPaymentMethods({
  minDeposit,
  licenseJurisdiction,
  geoRestrictions,
  withdrawalTime,
  establishedYear,
  cryptoMethodsJson,
  cryptoSupported = false,
  productType,
}: QuickInfoPaymentMethodsProps) {
  const displayType = productType
    ? formatProductTypesDisplay(parseProductTypes(productType))
    : "Sportsbook";
  const cryptoMethods = parseCryptoMethods(cryptoMethodsJson ?? null);
  const displayCrypto =
    cryptoMethods.length > 0
      ? cryptoMethods
      : DUMMY_CRYPTO_IDS.map((id) => ({ id }));

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
      <div className="grid grid-cols-1 divide-y divide-slate-100 md:grid-cols-2 md:divide-x md:divide-y-0">
        {/* Quick Info */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">Quick Info</h2>
          <dl className="mt-4 space-y-0">
            <div className="flex justify-between border-b border-slate-100 py-3">
              <dt className="text-sm text-gray-500">Min. Deposit</dt>
              <dd className="text-right text-sm font-medium text-gray-900">
                {minDeposit ?? "$10 (crypto)"}
              </dd>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-3">
              <dt className="text-sm text-gray-500">Withdrawal</dt>
              <dd className="text-right text-sm font-medium text-gray-900">
                {withdrawalTime ?? "Instant - 24 hours"}
              </dd>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-3">
              <dt className="text-sm text-gray-500">License</dt>
              <dd className="text-right text-sm font-medium text-gray-900">
                {licenseJurisdiction ?? "Curacao"}
              </dd>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-3">
              <dt className="text-sm text-gray-500">Available In</dt>
              <dd className="max-w-[60%] text-right text-sm font-medium text-gray-900">
                {geoRestrictions ?? "Most jurisdictions"}
              </dd>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-3 last:border-b-0">
              <dt className="text-sm text-gray-500">Established</dt>
              <dd className="text-right text-sm font-medium text-gray-900">
                {establishedYear ?? "2017"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Payment Methods */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">Payment Methods</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {displayCrypto.map((entry) => {
              const option =
                CRYPTO_OPTIONS[entry.id.toLowerCase()] ??
                CRYPTO_OPTIONS[entry.id.replace("-", "_")] ??
                {
                  name: (entry as { id: string; name?: string }).name ?? entry.id,
                  symbol: entry.id.slice(0, 4).toUpperCase(),
                };
              return (
                <span
                  key={entry.id}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700"
                >
                  <span
                    className="font-bold"
                    style={{ color: option.color ?? "#475569" }}
                  >
                    {option.symbol.charAt(0)}
                  </span>
                  {option.name}
                </span>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
            <svg
              className="h-5 w-5 shrink-0 text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Cryptocurrency supported.
          </div>
        </div>
      </div>
      <div className="flex justify-between border-t border-slate-100 px-6 py-4">
        <span className="text-sm text-gray-500">Type of betting</span>
        <span className="text-sm font-medium text-gray-900">{displayType}</span>
      </div>
    </section>
  );
}
