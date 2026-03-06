"use client";

import { useState } from "react";
import { decimalToAmerican, formatAmerican } from "@/lib/calculators";

/** Break-even: win prob needed = 1/decimal = implied prob */
export function BreakEvenCalc() {
  const [odds, setOdds] = useState("1.91");
  const [useAmerican, setUseAmerican] = useState(false);

  const parseOdds = (s: string): number => {
    if (useAmerican) {
      const raw = s.replace(/^\+/, "");
      const n = parseInt(raw, 10);
      if (!Number.isFinite(n) || n === 0) return 0;
      return n >= 100 ? 1 + n / 100 : n <= -100 ? 1 + 100 / Math.abs(n) : 0;
    }
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 1 ? n : 0;
  };

  const dec = parseOdds(odds);
  const breakEvenPct = dec > 0 ? (1 / dec) * 100 : 0;
  const american = dec > 0 ? decimalToAmerican(dec) : 0;

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        Find the win rate you need to break even at given odds. Bet only when you believe you exceed this rate.
      </p>

      <div>
        <label className="block text-sm font-medium text-slate-700">Odds format</label>
        <div className="mt-2 flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="be-format"
              checked={useAmerican}
              onChange={() => setUseAmerican(true)}
              className="h-4 w-4 border-slate-300 text-felt focus:ring-felt"
            />
            <span className="text-sm">American</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="be-format"
              checked={!useAmerican}
              onChange={() => setUseAmerican(false)}
              className="h-4 w-4 border-slate-300 text-felt focus:ring-felt"
            />
            <span className="text-sm">Decimal</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="be-odds" className="block text-sm font-medium text-slate-700">
          Odds
        </label>
        <input
          id="be-odds"
          type="text"
          value={odds}
          onChange={(e) => setOdds(e.target.value.replace(/[^\d.-]/g, ""))}
          placeholder={useAmerican ? "-110" : "1.91"}
          className="mt-1 block w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
        />
        {american !== 0 && useAmerican && (
          <p className="mt-1 text-xs text-slate-500">Decimal: {dec.toFixed(2)}</p>
        )}
        {dec > 0 && !useAmerican && (
          <p className="mt-1 text-xs text-slate-500">American: {formatAmerican(american)}</p>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Results</h3>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-500">Break-even win rate</dt>
            <dd className="text-xl font-bold text-slate-900">
              {breakEvenPct > 0 ? `${breakEvenPct.toFixed(1)}%` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Implied probability</dt>
            <dd className="text-xl font-bold text-slate-900">
              {breakEvenPct > 0 ? `${breakEvenPct.toFixed(1)}%` : "—"}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-sm text-slate-600">
          You need to win at least {breakEvenPct.toFixed(1)}% of bets at these odds to break even. To profit, you need a higher win rate.
        </p>
      </div>

      <section className="mt-10 border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold text-slate-900">How to use the Break-Even Calculator</h3>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-slate-600">
          <li>Enter the odds you&apos;re getting (American or decimal).</li>
          <li>The break-even rate equals the implied probability of the odds.</li>
          <li>Only bet when you believe your true win probability exceeds this rate.</li>
        </ol>
        <h4 className="mt-4 font-medium text-slate-800">Common break-even rates</h4>
        <ul className="mt-2 list-inside space-y-1 text-sm text-slate-600">
          <li><strong>-110</strong> — 52.38% to break even (standard spread odds)</li>
          <li><strong>+100 (evens)</strong> — 50% to break even</li>
          <li><strong>+200</strong> — 33.33% to break even</li>
          <li><strong>-200</strong> — 66.67% to break even</li>
        </ul>
      </section>
    </div>
  );
}
