"use client";

import { useState } from "react";

interface Leg {
  id: string;
  odds: string;
  valid: boolean;
}

const DEFAULT_ODDS = "2.00";

export function ParlayCalc() {
  const [legs, setLegs] = useState<Leg[]>([
    { id: "1", odds: DEFAULT_ODDS, valid: true },
    { id: "2", odds: DEFAULT_ODDS, valid: true },
  ]);
  const [stake, setStake] = useState("10");
  const [oddsFormat, setOddsFormat] = useState<"decimal" | "american">("decimal");

  const parseAmerican = (s: string): number => {
    const raw = s.replace(/^\+/, "");
    const n = parseInt(raw, 10);
    if (!Number.isFinite(n) || n === 0) return 0;
    return n >= 100 ? 1 + n / 100 : 1 + 100 / Math.abs(n);
  };

  const toDecimal = (s: string): number => {
    if (oddsFormat === "decimal") {
      const n = parseFloat(s);
      return Number.isFinite(n) && n > 0 ? n : 0;
    }
    return parseAmerican(s);
  };

  const decimals = legs
    .filter((l) => l.valid)
    .map((l) => toDecimal(l.odds))
    .filter((d) => d > 0);

  const combinedDecimal = decimals.length > 0 ? decimals.reduce((a, b) => a * b, 1) : 0;
  const stakeNum = parseFloat(stake);
  const validStake = Number.isFinite(stakeNum) && stakeNum > 0 ? stakeNum : 0;
  const potentialProfit = combinedDecimal > 0 ? (combinedDecimal - 1) * validStake : 0;
  const totalPayout = combinedDecimal > 0 && validStake > 0 ? combinedDecimal * validStake : 0;

  const addLeg = () => {
    setLegs((prev) => [
      ...prev,
      { id: String(Date.now()), odds: DEFAULT_ODDS, valid: true },
    ]);
  };

  const removeLeg = (id: string) => {
    if (legs.length <= 2) return;
    setLegs((prev) => prev.filter((l) => l.id !== id));
  };

  const updateLeg = (id: string, odds: string) => {
    setLegs((prev) =>
      prev.map((l) => (l.id === id ? { ...l, odds, valid: odds.length > 0 } : l))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700">Odds format</label>
        <div className="mt-2 flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="parlay-format"
              checked={oddsFormat === "decimal"}
              onChange={() => setOddsFormat("decimal")}
              className="h-4 w-4 border-slate-300 text-felt focus:ring-felt"
            />
            <span className="text-sm">Decimal</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="parlay-format"
              checked={oddsFormat === "american"}
              onChange={() => setOddsFormat("american")}
              className="h-4 w-4 border-slate-300 text-felt focus:ring-felt"
            />
            <span className="text-sm">American</span>
          </label>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700">Legs</label>
          <button
            type="button"
            onClick={addLeg}
            className="text-sm font-medium text-felt hover:underline"
          >
            + Add leg
          </button>
        </div>
        <div className="mt-2 space-y-2">
          {legs.map((leg, i) => (
            <div key={leg.id} className="flex items-center gap-2">
              <span className="w-8 text-sm text-slate-500">{i + 1}.</span>
              <input
                type={oddsFormat === "decimal" ? "number" : "text"}
                step="0.01"
                min="1.01"
                value={leg.odds}
                onChange={(e) => updateLeg(leg.id, e.target.value)}
                placeholder={oddsFormat === "decimal" ? "2.00" : "+100"}
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
              />
              <button
                type="button"
                onClick={() => removeLeg(leg.id)}
                disabled={legs.length <= 2}
                className="rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-40"
                aria-label="Remove leg"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="parlay-stake" className="block text-sm font-medium text-slate-700">
          Stake ($)
        </label>
        <input
          id="parlay-stake"
          type="number"
          step="0.01"
          min="0"
          value={stake}
          onChange={(e) => setStake(e.target.value)}
          className="mt-1 block w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Results
        </h3>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-500">Combined odds (decimal)</dt>
            <dd className="text-xl font-bold text-slate-900">
              {combinedDecimal > 0 ? combinedDecimal.toFixed(2) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Potential profit</dt>
            <dd className="text-xl font-bold text-slate-900">
              {potentialProfit > 0 ? `$${potentialProfit.toFixed(2)}` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Total payout</dt>
            <dd className="text-xl font-bold text-slate-900">
              {totalPayout > 0 ? `$${totalPayout.toFixed(2)}` : "—"}
            </dd>
          </div>
        </dl>
      </div>

      <section className="mt-10 border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold text-slate-900">How to use the Parlay Calculator</h3>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-slate-600">
          <li>Choose decimal or American odds format.</li>
          <li>Add each leg of your parlay and enter the odds. Use &quot;+ Add leg&quot; for more picks.</li>
          <li>Enter your total stake (the amount you&apos;re risking on the entire parlay).</li>
          <li>Review the combined odds, potential profit, and total payout.</li>
        </ol>
        <h4 className="mt-4 font-medium text-slate-800">What to look for</h4>
        <ul className="mt-2 list-inside space-y-1 text-sm text-slate-600">
          <li><strong>Combined odds</strong> — Multiply across legs, so more legs = higher payout but much lower win chance.</li>
          <li><strong>Risk vs reward</strong> — A 4-leg parlay might pay 10x, but each leg must win. One loss wipes the stake.</li>
          <li><strong>Same-game parlays</strong> — Popular but often worse value; check if the combined odds justify the risk.</li>
        </ul>
      </section>
    </div>
  );
}
