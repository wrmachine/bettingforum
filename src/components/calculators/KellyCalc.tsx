"use client";

import { useState } from "react";
import { decimalToAmerican, formatAmerican } from "@/lib/calculators";

/** Kelly Criterion: f* = (bp - q) / b where b = decimal odds - 1, p = win prob, q = 1-p */
export function KellyCalc() {
  const [bankroll, setBankroll] = useState("1000");
  const [odds, setOdds] = useState("2.00");
  const [winProb, setWinProb] = useState("50");
  const [fraction, setFraction] = useState("0.5");

  const bankrollNum = parseFloat(bankroll);
  const oddsNum = parseFloat(odds);
  const p = parseFloat(winProb) / 100;
  const frac = parseFloat(fraction);

  const validBankroll = Number.isFinite(bankrollNum) && bankrollNum > 0 ? bankrollNum : 0;
  const validOdds = Number.isFinite(oddsNum) && oddsNum > 1 ? oddsNum : 0;
  const validP = p >= 0 && p <= 1 ? p : 0;
  const validFrac = Number.isFinite(frac) && frac > 0 && frac <= 2 ? frac : 0.5;

  const b = validOdds > 0 ? validOdds - 1 : 0;
  const q = 1 - validP;
  const fullKelly = b > 0 && validP > 0 ? (b * validP - q) / b : 0;
  const kellyPct = Math.max(0, Math.min(1, fullKelly)) * 100;
  const fullKellyPct = fullKelly * 100;
  const fractionalKelly = kellyPct * validFrac;
  const stake = validBankroll > 0 ? (validBankroll * fractionalKelly) / 100 : 0;
  const american = validOdds > 0 ? decimalToAmerican(validOdds) : 0;

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        Kelly Criterion calculates the optimal bet size to maximize long-term bankroll growth. Use a fraction (e.g. 0.5 for half-Kelly) to reduce variance.
      </p>

      <div>
        <label htmlFor="kelly-bankroll" className="block text-sm font-medium text-slate-700">
          Bankroll ($)
        </label>
        <input
          id="kelly-bankroll"
          type="number"
          step="1"
          min="0"
          value={bankroll}
          onChange={(e) => setBankroll(e.target.value)}
          className="mt-1 block w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
        />
      </div>

      <div>
        <label htmlFor="kelly-odds" className="block text-sm font-medium text-slate-700">
          Decimal odds
        </label>
        <input
          id="kelly-odds"
          type="number"
          step="0.01"
          min="1.01"
          value={odds}
          onChange={(e) => setOdds(e.target.value)}
          className="mt-1 block w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
        />
        {american !== 0 && (
          <p className="mt-1 text-xs text-slate-500">American: {formatAmerican(american)}</p>
        )}
      </div>

      <div>
        <label htmlFor="kelly-winprob" className="block text-sm font-medium text-slate-700">
          Your estimated win probability (%)
        </label>
        <input
          id="kelly-winprob"
          type="number"
          step="0.1"
          min="0"
          max="100"
          value={winProb}
          onChange={(e) => setWinProb(e.target.value)}
          className="mt-1 block w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
        />
      </div>

      <div>
        <label htmlFor="kelly-fraction" className="block text-sm font-medium text-slate-700">
          Kelly fraction (0.25–1.0 recommended)
        </label>
        <input
          id="kelly-fraction"
          type="number"
          step="0.1"
          min="0.1"
          max="2"
          value={fraction}
          onChange={(e) => setFraction(e.target.value)}
          className="mt-1 block w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
        />
        <p className="mt-1 text-xs text-slate-500">0.5 = half-Kelly (common); 1.0 = full Kelly (aggressive)</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Results</h3>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-500">Full Kelly edge</dt>
            <dd className={`text-xl font-bold ${fullKellyPct > 0 ? "text-green-600" : fullKellyPct < 0 ? "text-red-600" : "text-slate-900"}`}>
              {validOdds > 0 && (validP > 0 || validP < 1) ? `${fullKellyPct >= 0 ? "+" : ""}${fullKellyPct.toFixed(1)}%` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Recommended stake ({validFrac}× Kelly)</dt>
            <dd className="text-xl font-bold text-slate-900">
              {stake > 0 ? `$${stake.toFixed(2)}` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">% of bankroll</dt>
            <dd className="text-xl font-bold text-slate-900">
              {fractionalKelly > 0 ? `${fractionalKelly.toFixed(1)}%` : "—"}
            </dd>
          </div>
        </dl>
      </div>

      <section className="mt-10 border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold text-slate-900">How to use the Kelly Calculator</h3>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-slate-600">
          <li>Enter your bankroll and the decimal odds for the bet.</li>
          <li>Estimate your true win probability (your edge vs. the market).</li>
          <li>Use a fractional Kelly (0.5 or less) to reduce variance and avoid over-betting.</li>
          <li>Bet only when the edge is positive; negative edge means no bet.</li>
        </ol>
        <h4 className="mt-4 font-medium text-slate-800">What to look for</h4>
        <ul className="mt-2 list-inside space-y-1 text-sm text-slate-600">
          <li><strong>Negative edge</strong> — Don&apos;t bet. Kelly says no.</li>
          <li><strong>Half-Kelly</strong> — Cuts variance roughly in half vs. full Kelly; most pros use 0.25–0.5.</li>
          <li><strong>Over-estimating probability</strong> — Be conservative. Over-betting destroys bankrolls quickly.</li>
        </ul>
      </section>
    </div>
  );
}
