"use client";

import { useState } from "react";

export function HedgeCalc() {
  const [originalStake, setOriginalStake] = useState("100");
  const [originalOdds, setOriginalOdds] = useState("2.50");
  const [hedgeOdds, setHedgeOdds] = useState("1.90");
  const [originalWon, setOriginalWon] = useState(true);

  const origStake = parseFloat(originalStake);
  const origOdds = parseFloat(originalOdds);
  const hOdds = parseFloat(hedgeOdds);

  const validOrig = Number.isFinite(origStake) && origStake > 0 ? origStake : 0;
  const validOrigOdds = Number.isFinite(origOdds) && origOdds > 1 ? origOdds : 0;
  const validHedgeOdds = Number.isFinite(hOdds) && hOdds > 1 ? hOdds : 0;

  const origPayout = validOrig * validOrigOdds;
  const hedgeStake = validOrigOdds > 0 && validHedgeOdds > 0
    ? origPayout / validHedgeOdds
    : 0;
  const guaranteedProfit = validOrigOdds > 0 && validHedgeOdds > 0 && hedgeStake > 0
    ? origPayout - validOrig - hedgeStake
    : 0;
  const totalStaked = validOrig + hedgeStake;

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        Hedge a future or live bet to lock in profit or reduce risk. Enter your original bet and the odds on the opposite outcome.
      </p>

      <div>
        <label className="block text-sm font-medium text-slate-700">Original bet result</label>
        <div className="mt-2 flex gap-4">
          {[true, false].map((won) => (
            <label key={String(won)} className="flex items-center gap-2">
              <input
                type="radio"
                name="hedge-orig"
                checked={originalWon === won}
                onChange={() => setOriginalWon(won)}
                className="h-4 w-4 border-slate-300 text-felt focus:ring-felt"
              />
              <span className="text-sm">{won ? "Still pending / will hedge" : "Already won"}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="hedge-orig-stake" className="block text-sm font-medium text-slate-700">
          Original stake ($)
        </label>
        <input
          id="hedge-orig-stake"
          type="number"
          step="0.01"
          min="0"
          value={originalStake}
          onChange={(e) => setOriginalStake(e.target.value)}
          className="mt-1 block w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
        />
      </div>

      <div>
        <label htmlFor="hedge-orig-odds" className="block text-sm font-medium text-slate-700">
          Original odds (decimal)
        </label>
        <input
          id="hedge-orig-odds"
          type="number"
          step="0.01"
          min="1.01"
          value={originalOdds}
          onChange={(e) => setOriginalOdds(e.target.value)}
          className="mt-1 block w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
        />
      </div>

      <div>
        <label htmlFor="hedge-odds" className="block text-sm font-medium text-slate-700">
          Hedge odds (opposite outcome, decimal)
        </label>
        <input
          id="hedge-odds"
          type="number"
          step="0.01"
          min="1.01"
          value={hedgeOdds}
          onChange={(e) => setHedgeOdds(e.target.value)}
          className="mt-1 block w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Results</h3>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-500">Hedge stake</dt>
            <dd className="text-xl font-bold text-slate-900">
              {hedgeStake > 0 ? `$${hedgeStake.toFixed(2)}` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Guaranteed profit</dt>
            <dd className={`text-xl font-bold ${guaranteedProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {hedgeStake > 0 ? `$${guaranteedProfit >= 0 ? "" : ""}${guaranteedProfit.toFixed(2)}` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Original win payout</dt>
            <dd className="text-xl font-bold text-slate-900">
              {validOrig > 0 && validOrigOdds > 0 ? `$${origPayout.toFixed(2)}` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Total staked (orig + hedge)</dt>
            <dd className="text-xl font-bold text-slate-900">
              {totalStaked > 0 ? `$${totalStaked.toFixed(2)}` : "—"}
            </dd>
          </div>
        </dl>
      </div>

      <section className="mt-10 border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold text-slate-900">How to use the Hedge Calculator</h3>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-slate-600">
          <li>Enter your original stake and decimal odds.</li>
          <li>Enter the odds available for the opposite outcome (the hedge).</li>
          <li>The calculator shows how much to stake on the hedge to lock in profit.</li>
          <li>If both legs win their respective outcomes, you profit the same either way.</li>
        </ol>
        <h4 className="mt-4 font-medium text-slate-800">When to hedge</h4>
        <ul className="mt-2 list-inside space-y-1 text-sm text-slate-600">
          <li><strong>Parlays</strong> — One leg hit, hedge the last leg to guarantee a profit.</li>
          <li><strong>Live bets</strong> — Your pre-game bet is winning; hedge in-play if odds moved.</li>
          <li><strong>Future bets</strong> — Lock in value when the hedge side offers good odds.</li>
        </ul>
      </section>
    </div>
  );
}
