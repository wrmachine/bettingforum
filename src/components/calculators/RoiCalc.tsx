"use client";

import { useState } from "react";

type Result = "win" | "loss" | "push";

export function RoiCalc() {
  const [stake, setStake] = useState("100");
  const [odds, setOdds] = useState("2.00");
  const [result, setResult] = useState<Result>("win");
  const stakeNum = parseFloat(stake);
  const oddsNum = parseFloat(odds);

  const validStake = Number.isFinite(stakeNum) && stakeNum > 0 ? stakeNum : 0;
  const validOdds = Number.isFinite(oddsNum) && oddsNum > 0 ? oddsNum : 0;

  let profit = 0;
  if (validStake > 0 && validOdds > 0) {
    if (result === "win") profit = validStake * (validOdds - 1);
    else if (result === "loss") profit = -validStake;
  }

  const roi = validStake > 0 ? (profit / validStake) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="roi-stake" className="block text-sm font-medium text-slate-700">
          Stake per bet ($)
        </label>
        <input
          id="roi-stake"
          type="number"
          step="0.01"
          min="0"
          value={stake}
          onChange={(e) => setStake(e.target.value)}
          className="mt-1 block w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
        />
      </div>

      <div>
        <label htmlFor="roi-odds" className="block text-sm font-medium text-slate-700">
          Odds (decimal)
        </label>
        <input
          id="roi-odds"
          type="number"
          step="0.01"
          min="1.01"
          value={odds}
          onChange={(e) => setOdds(e.target.value)}
          className="mt-1 block w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Result</label>
        <div className="mt-2 flex gap-4">
          {(["win", "loss", "push"] as const).map((r) => (
            <label key={r} className="flex items-center gap-2">
              <input
                type="radio"
                name="roi-result"
                checked={result === r}
                onChange={() => setResult(r)}
                className="h-4 w-4 border-slate-300 text-felt focus:ring-felt"
              />
              <span className="text-sm capitalize">{r}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Results
        </h3>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-500">Profit / Loss (this bet)</dt>
            <dd className={`text-xl font-bold ${profit >= 0 ? "text-slate-900" : "text-red-600"}`}>
              {validStake > 0 && validOdds > 0
                ? `$${profit >= 0 ? "+" : ""}${profit.toFixed(2)}`
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">ROI</dt>
            <dd className={`text-xl font-bold ${roi >= 0 ? "text-slate-900" : "text-red-600"}`}>
              {validStake > 0 ? `${roi >= 0 ? "+" : ""}${roi.toFixed(1)}%` : "—"}
            </dd>
          </div>
        </dl>
      </div>

      <section className="mt-10 border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold text-slate-900">How to use the ROI Calculator</h3>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-slate-600">
          <li>Enter the amount you staked on the bet.</li>
          <li>Enter the decimal odds you got (e.g. 2.00 for evens, 2.50 for 6/4).</li>
          <li>Select the result: Win, Loss, or Push (tie/void).</li>
          <li>The calculator shows your profit/loss and ROI for that bet.</li>
        </ol>
        <h4 className="mt-4 font-medium text-slate-800">What to look for</h4>
        <ul className="mt-2 list-inside space-y-1 text-sm text-slate-600">
          <li><strong>ROI over time</strong> — A single bet&apos;s ROI can swing wildly. Track many bets to see if you&apos;re profitable long-term.</li>
          <li><strong>Positive ROI</strong> — Consistently positive ROI suggests value; negative ROI means you&apos;re losing more than the vig.</li>
          <li><strong>Comparison</strong> — Use this alongside a bankroll calculator to see how each bet affects your overall position.</li>
        </ul>
      </section>
    </div>
  );
}
