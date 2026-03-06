"use client";

import { useState } from "react";
import { decimalToAmerican, americanToDecimal, formatAmerican } from "@/lib/calculators";

/** Proportional no-vig: fair prob = implied / total_implied, then convert back to odds */
export function NoVigCalc() {
  const [oddsA, setOddsA] = useState("-110");
  const [oddsB, setOddsB] = useState("-110");
  const [useAmerican, setUseAmerican] = useState(true);

  const parseAmerican = (s: string): number => {
    const raw = s.replace(/^\+/, "");
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n !== 0 ? n : 0;
  };

  const toDecimal = (s: string): number => {
    if (useAmerican) return americanToDecimal(parseAmerican(s));
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 1 ? n : 0;
  };

  const decA = toDecimal(oddsA);
  const decB = toDecimal(oddsB);

  const impA = decA > 0 ? 1 / decA : 0;
  const impB = decB > 0 ? 1 / decB : 0;
  const totalImplied = impA + impB;
  const vig = totalImplied > 0 ? (totalImplied - 1) * 100 : 0;

  const fairA = totalImplied > 0 ? impA / totalImplied : 0;
  const fairB = totalImplied > 0 ? impB / totalImplied : 0;
  const fairDecA = fairA > 0 && fairA < 1 ? 1 / fairA : 0;
  const fairDecB = fairB > 0 && fairB < 1 ? 1 / fairB : 0;
  const fairAmA = fairDecA > 0 ? decimalToAmerican(fairDecA) : 0;
  const fairAmB = fairDecB > 0 ? decimalToAmerican(fairDecB) : 0;

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        Remove the vig (juice) from a two-way market to see fair odds and true implied probabilities.
      </p>

      <div>
        <label className="block text-sm font-medium text-slate-700">Odds format</label>
        <div className="mt-2 flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="novig-format"
              checked={useAmerican}
              onChange={() => setUseAmerican(true)}
              className="h-4 w-4 border-slate-300 text-felt focus:ring-felt"
            />
            <span className="text-sm">American (+/-)</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="novig-format"
              checked={!useAmerican}
              onChange={() => setUseAmerican(false)}
              className="h-4 w-4 border-slate-300 text-felt focus:ring-felt"
            />
            <span className="text-sm">Decimal</span>
          </label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="novig-a" className="block text-sm font-medium text-slate-700">
            Outcome A odds
          </label>
          <input
            id="novig-a"
            type="text"
            value={oddsA}
            onChange={(e) => setOddsA(e.target.value.replace(/[^\d.-]/g, ""))}
            placeholder={useAmerican ? "-110" : "1.91"}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
          />
        </div>
        <div>
          <label htmlFor="novig-b" className="block text-sm font-medium text-slate-700">
            Outcome B odds
          </label>
          <input
            id="novig-b"
            type="text"
            value={oddsB}
            onChange={(e) => setOddsB(e.target.value.replace(/[^\d.-]/g, ""))}
            placeholder={useAmerican ? "-110" : "1.91"}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
          />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Results</h3>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-500">Vig (juice)</dt>
            <dd className="text-xl font-bold text-slate-900">
              {totalImplied > 0 ? `${vig.toFixed(1)}%` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Fair prob A</dt>
            <dd className="text-xl font-bold text-slate-900">
              {fairA > 0 ? `${(fairA * 100).toFixed(1)}%` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Fair prob B</dt>
            <dd className="text-xl font-bold text-slate-900">
              {fairB > 0 ? `${(fairB * 100).toFixed(1)}%` : "—"}
            </dd>
          </div>
        </dl>
        <div className="mt-4 border-t border-slate-200 pt-4">
          <h4 className="text-sm font-medium text-slate-700">Fair (no-vig) odds</h4>
          <div className="mt-2 flex flex-wrap gap-6">
            <div>
              <span className="text-xs text-slate-500">Outcome A: </span>
              <span className="font-bold">{fairDecA > 0 ? `${fairDecA.toFixed(2)} (${formatAmerican(fairAmA)})` : "—"}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500">Outcome B: </span>
              <span className="font-bold">{fairDecB > 0 ? `${fairDecB.toFixed(2)} (${formatAmerican(fairAmB)})` : "—"}</span>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-10 border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold text-slate-900">How to use the No-Vig Calculator</h3>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-slate-600">
          <li>Enter odds for both sides of a two-way market (e.g. Team A -110, Team B -110).</li>
          <li>The calculator removes the vig proportionally to reveal fair odds.</li>
          <li>Use fair odds to compare across sportsbooks or build models.</li>
        </ol>
        <h4 className="mt-4 font-medium text-slate-800">What to look for</h4>
        <ul className="mt-2 list-inside space-y-1 text-sm text-slate-600">
          <li><strong>Vig %</strong> — Typical sportsbook vig is 4–10%. Sharp books (e.g. Pinnacle) are lower.</li>
          <li><strong>Fair odds</strong> — True market probability without the book&apos;s margin. Use for EV calculations.</li>
          <li><strong>Compare books</strong> — Lower vig = better value. Shop for the best odds on each side.</li>
        </ul>
      </section>
    </div>
  );
}
