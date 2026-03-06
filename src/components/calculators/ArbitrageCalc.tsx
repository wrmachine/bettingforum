"use client";

import { useState } from "react";

interface Outcome {
  id: string;
  odds: string;
  label: string;
}

const parseDecimal = (s: string): number => {
  const n = parseFloat(s);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export function ArbitrageCalc() {
  const [totalStake, setTotalStake] = useState("100");
  const [outcomes, setOutcomes] = useState<Outcome[]>([
    { id: "1", odds: "2.10", label: "Outcome A" },
    { id: "2", odds: "2.10", label: "Outcome B" },
  ]);

  const decimals = outcomes.map((o) => parseDecimal(o.odds)).filter((d) => d > 0);
  const totalImplied = decimals.reduce((sum, d) => sum + 1 / d, 0);
  const isArb = totalImplied < 1;
  const arbPercent = totalImplied > 0 ? (1 - totalImplied) * 100 : 0;

  const stakeNum = parseFloat(totalStake);
  const validStake = Number.isFinite(stakeNum) && stakeNum > 0 ? stakeNum : 0;

  const stakes = decimals.map((d) => (validStake > 0 && totalImplied > 0 ? (validStake / d) / totalImplied : 0));
  const profits = stakes.map((s, i) => (decimals[i] > 0 ? s * (decimals[i] - 1) : 0));
  const profit = profits[0] ?? 0;

  const addOutcome = () => {
    setOutcomes((prev) => [
      ...prev,
      { id: String(Date.now()), odds: "2.00", label: `Outcome ${prev.length + 1}` },
    ]);
  };

  const removeOutcome = (id: string) => {
    if (outcomes.length <= 2) return;
    setOutcomes((prev) => prev.filter((o) => o.id !== id));
  };

  const updateOutcome = (id: string, updates: Partial<Outcome>) => {
    setOutcomes((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates } : o))
    );
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        Enter the best odds for each outcome across different sportsbooks. If total implied probability &lt; 100%, you have an arbitrage opportunity.
      </p>

      <div>
        <label htmlFor="arb-stake" className="block text-sm font-medium text-slate-700">
          Total stake ($)
        </label>
        <input
          id="arb-stake"
          type="number"
          step="0.01"
          min="0"
          value={totalStake}
          onChange={(e) => setTotalStake(e.target.value)}
          className="mt-1 block w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700">Outcomes</label>
          <button
            type="button"
            onClick={addOutcome}
            className="text-sm font-medium text-felt hover:underline"
          >
            + Add outcome
          </button>
        </div>
        <div className="mt-2 space-y-2">
          {outcomes.map((o, i) => (
            <div key={o.id} className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={o.label}
                onChange={(e) => updateOutcome(o.id, { label: e.target.value })}
                placeholder={`Outcome ${i + 1}`}
                className="w-28 rounded-md border border-slate-300 px-2 py-2 text-sm text-slate-900 focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
              />
              <input
                type="number"
                step="0.01"
                min="1.01"
                value={o.odds}
                onChange={(e) => updateOutcome(o.id, { odds: e.target.value })}
                placeholder="2.00"
                className="w-24 rounded-md border border-slate-300 px-2 py-2 text-slate-900 focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
              />
              <span className="text-xs text-slate-500">decimal</span>
              {outcomes.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOutcome(o.id)}
                  className="rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                  aria-label="Remove"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              {stakes[i] !== undefined && stakes[i] > 0 && (
                <span className="text-sm font-medium text-felt">
                  Stake: ${stakes[i].toFixed(2)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Results
        </h3>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-500">Total implied probability</dt>
            <dd className="text-xl font-bold text-slate-900">
              {(totalImplied * 100).toFixed(1)}%
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Arbitrage opportunity</dt>
            <dd className={`text-xl font-bold ${isArb ? "text-green-600" : "text-slate-900"}`}>
              {isArb ? `Yes (${arbPercent.toFixed(1)}% margin)` : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Guaranteed profit</dt>
            <dd className="text-xl font-bold text-slate-900">
              {isArb && profit > 0 ? `$${profit.toFixed(2)}` : "—"}
            </dd>
          </div>
        </dl>
      </div>

      <section className="mt-10 border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold text-slate-900">How to use the Arbitrage Calculator</h3>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-slate-600">
          <li>Find the best odds for each outcome across different sportsbooks (e.g. Team A win, Team B win, or draw).</li>
          <li>Enter each outcome&apos;s label and best available decimal odds.</li>
          <li>Set your total stake. The calculator splits it optimally across outcomes.</li>
          <li>Check if &quot;Arbitrage opportunity&quot; shows Yes and review the stake per outcome.</li>
        </ol>
        <h4 className="mt-4 font-medium text-slate-800">What to look for</h4>
        <ul className="mt-2 list-inside space-y-1 text-sm text-slate-600">
          <li><strong>Total implied probability &lt; 100%</strong> — That&apos;s a surebet. Stake on all outcomes to guarantee profit.</li>
          <li><strong>Margin size</strong> — Larger margins mean more profit, but true arbs are rare; they often disappear quickly or involve small stakes.</li>
          <li><strong>Account limits</strong> — Sportsbooks may limit bet sizes if they detect arb activity. Spread stakes across multiple books.</li>
        </ul>
      </section>
    </div>
  );
}
