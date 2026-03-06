"use client";

import { useState } from "react";

/** Common teaser payouts: legs -> decimal odds (approx) */
const TEASER_PAYOUTS: Record<string, Record<number, number>> = {
  "6": { 2: 1.91, 3: 2.65, 4: 3.65, 5: 5.10, 6: 7.00 },
  "6.5": { 2: 1.91, 3: 2.65, 4: 3.65, 5: 5.10, 6: 7.00 },
  "7": { 2: 1.83, 3: 2.50, 4: 3.40, 5: 4.60, 6: 6.20 },
};

export function TeaserCalc() {
  const [stake, setStake] = useState("100");
  const [points, setPoints] = useState("6");
  const [legs, setLegs] = useState("3");

  const stakeNum = parseFloat(stake);
  const legsNum = parseInt(legs, 10);

  const validStake = Number.isFinite(stakeNum) && stakeNum > 0 ? stakeNum : 0;
  const validLegs = legsNum >= 2 && legsNum <= 6 ? legsNum : 3;
  const payouts = TEASER_PAYOUTS[points] ?? TEASER_PAYOUTS["6"];
  const odds = payouts[validLegs] ?? 2.65;
  const payout = validStake > 0 ? validStake * odds : 0;
  const profit = payout - validStake;

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        Teaser bets adjust point spreads and totals in your favor across multiple games for lower payouts than parlays.
      </p>

      <div>
        <label htmlFor="teaser-stake" className="block text-sm font-medium text-slate-700">
          Stake ($)
        </label>
        <input
          id="teaser-stake"
          type="number"
          step="0.01"
          min="0"
          value={stake}
          onChange={(e) => setStake(e.target.value)}
          className="mt-1 block w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
        />
      </div>

      <div>
        <label htmlFor="teaser-points" className="block text-sm font-medium text-slate-700">
          Teaser points
        </label>
        <select
          id="teaser-points"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          className="mt-1 block w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
        >
          <option value="6">6-point (NFL/CFB)</option>
          <option value="6.5">6.5-point</option>
          <option value="7">7-point</option>
        </select>
      </div>

      <div>
        <label htmlFor="teaser-legs" className="block text-sm font-medium text-slate-700">
          Number of legs
        </label>
        <select
          id="teaser-legs"
          value={legs}
          onChange={(e) => setLegs(e.target.value)}
          className="mt-1 block w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
        >
          {[2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>{n} legs</option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Results</h3>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-500">Total payout</dt>
            <dd className="text-xl font-bold text-slate-900">
              {payout > 0 ? `$${payout.toFixed(2)}` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Profit if all win</dt>
            <dd className="text-xl font-bold text-green-600">
              {profit > 0 ? `+$${profit.toFixed(2)}` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Decimal odds</dt>
            <dd className="text-xl font-bold text-slate-900">
              {odds > 0 ? odds.toFixed(2) : "—"}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-slate-500">
          Payouts vary by sportsbook. These are typical {points}-point teaser payouts.
        </p>
      </div>

      <section className="mt-10 border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold text-slate-900">How to use the Teaser Calculator</h3>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-slate-600">
          <li>Select teaser points (6, 6.5, or 7) and number of legs.</li>
          <li>Enter your stake. The calculator shows potential payout if all legs win.</li>
          <li>Tease key numbers: -6, -7, +3, +7 cross important thresholds.</li>
        </ol>
        <h4 className="mt-4 font-medium text-slate-800">Teaser strategy</h4>
        <ul className="mt-2 list-inside space-y-1 text-sm text-slate-600">
          <li><strong>6-point NFL</strong> — Crossing 3 and 7 is valuable (e.g. -7.5 to -1.5).</li>
          <li><strong>2-team 6pt</strong> — Often -110; similar to parlay but with spread help.</li>
          <li><strong>All legs must win</strong> — One miss = full loss. Choose carefully.</li>
        </ul>
      </section>
    </div>
  );
}
