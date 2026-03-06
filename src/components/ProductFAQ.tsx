"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface ProductFAQProps {
  items?: FAQItem[];
}

const DEFAULT_FAQ: FAQItem[] = [
  {
    question: "Is Stake.com legit?",
    answer:
      "Yes. Stake.com is licensed and regulated in Curacao. It has built a strong reputation among crypto bettors for fast payouts, fair odds, and reliable customer support. Always verify licensing in your jurisdiction before signing up.",
  },
  {
    question: "What cryptocurrencies are accepted?",
    answer:
      "Stake.com accepts Bitcoin, Ethereum, Litecoin, USDT, Dogecoin, and several other major cryptocurrencies. Deposits and withdrawals are processed quickly, often within minutes, with no KYC required for crypto-only users.",
  },
  {
    question: "How fast are withdrawals?",
    answer:
      "Crypto withdrawals are typically processed within 24 hours, and often within minutes. Fiat withdrawals may take longer depending on the method. Stake prioritizes fast payouts for crypto users.",
  },
];

export function ProductFAQ({ items = DEFAULT_FAQ }: ProductFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
      <div className="px-8 py-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Frequently Asked Questions
        </h2>
        <div className="mt-6 divide-y divide-slate-100">
          {items.map((item, i) => (
            <div key={i} className="py-4 first:pt-0 last:pb-0">
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 text-left"
              >
                <span className="font-medium text-gray-900">{item.question}</span>
                <svg
                  className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openIndex === i && (
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {item.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
