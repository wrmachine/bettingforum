"use client";

import { useState } from "react";

/** EV = (p * profit_if_win) - ((1-p) * stake) */
export function EvCalc() {
  const [stake, setStake] = useState("100");
  const [odds, setOdds] = useState("2.00");
  const [winProb, setWinProb] = useState("55");

  const stakeNum = parseFloat(stake);
  const oddsNum = parseFloat(odds);
  const p = parseFloat(winProb) / 100;

  const validStake = Number.isFinite(stakeNum) && stakeNum > 0 ? stakeNum : 0;
  const validOdds = Number.isFinite(oddsNum) && oddsNum > 1 ? oddsNum : 0;
  const validP = p >= 0 && p <= 1 ? p : 0;

  const profitIfWin = validStake > 0 && validOdds > 0 ? validStake * (validOdds - 1) : 0;
  const ev = validStake > 0 && validOdds > 0
    ? validP * profitIfWin - (1 - validP) * validStake
    : 0;
  const evPercent = validStake > 0 ? (ev / validStake) * 100 : 0;
  const impliedProb = validOdds > 0 ? (1 / validOdds) * 100 : 0;
  const edge = validP > 0 ? validP * 100 - impliedProb : 0;

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        Expected Value (EV) tells you whether a bet is profitable long-term. Positive EV = value bet.
      </p>

      <div>
        <label htmlFor="ev-stake" className="block text-sm font-medium text-slate-700">
          Stake ($)
        </label>
        <input
          id="ev-stake"
          type="number"
          step="0.01"
          min="0"
          value={stake}
          onChange={(e) => setStake(e.target.value)}
          className="mt-1 block w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
        />
      </div>

      <div>
        <label htmlFor="ev-odds" className="block text-sm font-medium text-slate-700">
          Decimal odds
        </label>
        <input
          id="ev-odds"
          type="number"
          step="0.01"
          min="1.01"
          value={odds}
          onChange={(e) => setOdds(e.target.value)}
          className="mt-1 block w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
        />
        {impliedProb > 0 && (
          <p className="mt-1 text-xs text-slate-500">Implied probability: {impliedProb.toFixed(1)}%</p>
        )}
      </div>

      <div>
        <label htmlFor="ev-winprob" className="block text-sm font-medium text-slate-700">
          Your estimated win probability (%)
        </label>
        <input
          id="ev-winprob"
          type="number"
          step="0.1"
          min="0"
          max="100"
          value={winProb}
          onChange={(e) => setWinProb(e.target.value)}
          className="mt-1 block w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Results</h3>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-500">Expected Value</dt>
            <dd className={`text-xl font-bold ${ev > 0 ? "text-green-600" : ev < 0 ? "text-red-600" : "text-slate-900"}`}>
              {validStake > 0 && validOdds > 0 ? `$${ev >= 0 ? "+" : ""}${ev.toFixed(2)}` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">EV % per bet</dt>
            <dd className={`text-xl font-bold ${evPercent > 0 ? "text-green-600" : evPercent < 0 ? "text-red-600" : "text-slate-900"}`}>
              {validStake > 0 ? `${evPercent >= 0 ? "+" : ""}${evPercent.toFixed(1)}%` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Edge vs. odds</dt>
            <dd className={`text-xl font-bold ${edge > 0 ? "text-green-600" : edge < 0 ? "text-red-600" : "text-slate-900"}`}>
              {validOdds > 0 ? `${edge >= 0 ? "+" : ""}${edge.toFixed(1)}pp` : "—"}
            </dd>
          </div>
        </dl>
      </div>

      <section className="mt-10 border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold text-slate-900">How to use the EV Calculator</h3>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-slate-600">
          <li>Enter your stake and the decimal odds offered.</li>
          <li>Estimate the true probability of the outcome (your model or fair odds).</li>
          <li>Positive EV = value bet. Negative EV = bet to avoid.</li>
          <li>Over many bets, average profit should approach the EV per bet.</li>
        </ol>
        <h4 className="mt-4 font-medium text-slate-800">What to look for</h4>
        <ul className="mt-2 list-inside space-y-1 text-sm text-slate-600">
          <li><strong>+EV</strong> — Your edge exceeds the vig. Bet when bankroll and Kelly allow.</li>
          <li><strong>Edge</strong> — How many percentage points your estimate exceeds the implied probability.</li>
          <li><strong>Be honest</strong> — Over-estimating win probability leads to false +EV and losses.</li>
        </ul>
      </section>
    </div>
  );
}
