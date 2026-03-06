"use client";

import { useState } from "react";

export function BankrollCalc() {
  const [bankroll, setBankroll] = useState("1000");
  const [unitSize, setUnitSize] = useState("1");
  const [unitPercent, setUnitPercent] = useState("");
  const [odds, setOdds] = useState("2.00");
  const [numBets, setNumBets] = useState("100");

  const bankrollNum = parseFloat(bankroll);
  const unitNum = parseFloat(unitSize);
  const unitPct = unitPercent ? parseFloat(unitPercent) : null;
  const oddsNum = parseFloat(odds);
  const n = parseInt(numBets, 10);

  const validBankroll = Number.isFinite(bankrollNum) && bankrollNum > 0 ? bankrollNum : 0;
  const validUnit = Number.isFinite(unitNum) && unitNum > 0 ? unitNum : 0;
  const validOdds = Number.isFinite(oddsNum) && oddsNum > 0 ? oddsNum : 0;
  const validN = Number.isInteger(n) && n > 0 ? n : 0;

  // Unit as % of bankroll
  const unitAsPercent =
    validBankroll > 0 && validUnit > 0 ? (validUnit / validBankroll) * 100 : 0;
  const stakeFromPercent =
    unitPct !== null && Number.isFinite(unitPct) && unitPct > 0 && validBankroll > 0
      ? (unitPct / 100) * validBankroll
      : validUnit;

  const stake = unitPercent ? stakeFromPercent : validUnit;
  const kellyFraction = validOdds > 0 ? 1 / validOdds : 0;
  const kellyStake = validBankroll > 0 && kellyFraction > 0 ? validBankroll * kellyFraction : 0;

  // Simplified variance: assume 50% win rate at given odds for illustration
  const evPerBet = stake * (validOdds - 1) * 0.5 - stake * 0.5;
  const variance = validN > 0 ? Math.sqrt(validN) * stake * 0.5 : 0;

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        Manage risk by betting in units. A unit is typically 1–2% of your bankroll per bet.
      </p>

      <div>
        <label htmlFor="bankroll" className="block text-sm font-medium text-slate-700">
          Bankroll ($)
        </label>
        <input
          id="bankroll"
          type="number"
          step="1"
          min="0"
          value={bankroll}
          onChange={(e) => setBankroll(e.target.value)}
          className="mt-1 block w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="unit-size" className="block text-sm font-medium text-slate-700">
            Unit size ($)
          </label>
          <input
            id="unit-size"
            type="number"
            step="0.01"
            min="0"
            value={unitSize}
            onChange={(e) => {
              setUnitSize(e.target.value);
              setUnitPercent("");
            }}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
          />
        </div>
        <div>
          <label htmlFor="unit-pct" className="block text-sm font-medium text-slate-700">
            Or unit (% of bankroll)
          </label>
          <input
            id="unit-pct"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={unitPercent}
            onChange={(e) => {
              setUnitPercent(e.target.value);
              if (e.target.value && validBankroll > 0) {
                const pct = parseFloat(e.target.value);
                if (Number.isFinite(pct)) setUnitSize(String((pct / 100) * validBankroll));
              }
            }}
            placeholder="e.g. 2"
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
          />
        </div>
      </div>

      <div>
        <label htmlFor="bankroll-odds" className="block text-sm font-medium text-slate-700">
          Typical odds (decimal)
        </label>
        <input
          id="bankroll-odds"
          type="number"
          step="0.01"
          min="1.01"
          value={odds}
          onChange={(e) => setOdds(e.target.value)}
          className="mt-1 block w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
        />
      </div>

      <div>
        <label htmlFor="bankroll-bets" className="block text-sm font-medium text-slate-700">
          Bets to simulate
        </label>
        <input
          id="bankroll-bets"
          type="number"
          min="1"
          value={numBets}
          onChange={(e) => setNumBets(e.target.value)}
          className="mt-1 block w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Results
        </h3>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-500">Unit as % of bankroll</dt>
            <dd className="text-xl font-bold text-slate-900">
              {unitAsPercent > 0 ? `${unitAsPercent.toFixed(1)}%` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Stake per bet</dt>
            <dd className="text-xl font-bold text-slate-900">
              ${stake > 0 ? stake.toFixed(2) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Full Kelly stake</dt>
            <dd className="text-xl font-bold text-slate-900">
              ${kellyStake > 0 ? kellyStake.toFixed(2) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">~Std dev over {validN} bets</dt>
            <dd className="text-xl font-bold text-slate-900">
              ±${variance > 0 ? variance.toFixed(0) : "—"}
            </dd>
          </div>
        </dl>
      </div>

      <section className="mt-10 border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold text-slate-900">How to use the Bankroll Calculator</h3>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-slate-600">
          <li>Enter your total bankroll (money you&apos;re willing to risk on betting).</li>
          <li>Set your unit size in dollars or as a percentage of bankroll (1–2% is typical).</li>
          <li>Enter your typical odds to see Kelly stake and variance estimates.</li>
          <li>Use &quot;Bets to simulate&quot; to see approximate standard deviation over that many bets.</li>
        </ol>
        <h4 className="mt-4 font-medium text-slate-800">What to look for</h4>
        <ul className="mt-2 list-inside space-y-1 text-sm text-slate-600">
          <li><strong>Unit size</strong> — 1–2% per bet is conservative; 3–5% increases variance. Never bet more than you can afford to lose.</li>
          <li><strong>Full Kelly</strong> — Mathematically optimal but aggressive. Most bettors use half-Kelly or less to reduce swings.</li>
          <li><strong>Standard deviation</strong> — Shows expected swing over N bets. Higher variance = more ups and downs; size units accordingly.</li>
        </ul>
      </section>
    </div>
  );
}
