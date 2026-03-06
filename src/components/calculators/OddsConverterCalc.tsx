"use client";

import { useState, useCallback } from "react";
import type { OddsFormat } from "@/lib/calculators";
import {
  decimalToAmerican,
  americanToDecimal,
  decimalToFractional,
  fractionalToDecimal,
  formatFractional,
  formatAmerican,
} from "@/lib/calculators";

const INPUT_ID = "odds-input";

export function OddsConverterCalc() {
  const [format, setFormat] = useState<OddsFormat>("decimal");
  const [inputValue, setInputValue] = useState("2.00");
  const [fracNum, setFracNum] = useState("1");
  const [fracDen, setFracDen] = useState("1");

  const parseDecimal = useCallback((): number => {
    const n = parseFloat(inputValue);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [inputValue]);

  const parseAmerican = useCallback((): number => {
    const raw = inputValue.replace(/^\+/, "");
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n !== 0 ? n : 0;
  }, [inputValue]);

  const getDecimal = useCallback((): number => {
    if (format === "decimal") return parseDecimal();
    if (format === "american") return americanToDecimal(parseAmerican());
    const num = parseInt(fracNum, 10);
    const den = parseInt(fracDen, 10);
    return fractionalToDecimal(num, den);
  }, [format, parseDecimal, parseAmerican, fracNum, fracDen]);

  const decimal = getDecimal();
  const american = decimal > 0 ? decimalToAmerican(decimal) : 0;
  const frac = decimal > 0 ? decimalToFractional(decimal) : { num: 0, den: 1 };
  const implied = decimal > 0 ? (1 / decimal) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor={INPUT_ID} className="block text-sm font-medium text-slate-700">
          Enter odds (any format)
        </label>
        <div className="mt-2 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <input
              id={INPUT_ID}
              type="radio"
              name="format"
              checked={format === "decimal"}
              onChange={() => setFormat("decimal")}
              className="h-4 w-4 border-slate-300 text-felt focus:ring-felt"
            />
            <label htmlFor={INPUT_ID} className="text-sm text-slate-700">
              Decimal
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              name="format"
              checked={format === "american"}
              onChange={() => setFormat("american")}
              className="h-4 w-4 border-slate-300 text-felt focus:ring-felt"
            />
            <label className="text-sm text-slate-700">American</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              name="format"
              checked={format === "fractional"}
              onChange={() => setFormat("fractional")}
              className="h-4 w-4 border-slate-300 text-felt focus:ring-felt"
            />
            <label className="text-sm text-slate-700">Fractional</label>
          </div>
        </div>
      </div>

      {format === "decimal" && (
        <div>
          <label htmlFor="decimal-val" className="block text-sm font-medium text-slate-700">
            Decimal odds
          </label>
          <input
            id="decimal-val"
            type="number"
            step="0.01"
            min="1.01"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="mt-1 block w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
          />
        </div>
      )}
      {format === "american" && (
        <div>
          <label htmlFor="american-val" className="block text-sm font-medium text-slate-700">
            American odds (e.g. +200 or -150)
          </label>
          <input
            id="american-val"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.replace(/[^\d+-]/g, ""))}
            className="mt-1 block w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
            placeholder="+200"
          />
        </div>
      )}
      {format === "fractional" && (
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="frac-num" className="block text-sm font-medium text-slate-700">
              Numerator
            </label>
            <input
              id="frac-num"
              type="number"
              min="1"
              value={fracNum}
              onChange={(e) => setFracNum(e.target.value)}
              className="mt-1 block w-24 rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
            />
          </div>
          <span className="pb-2 text-slate-500">/</span>
          <div>
            <label htmlFor="frac-den" className="block text-sm font-medium text-slate-700">
              Denominator
            </label>
            <input
              id="frac-den"
              type="number"
              min="1"
              value={fracDen}
              onChange={(e) => setFracDen(e.target.value)}
              className="mt-1 block w-24 rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
            />
          </div>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Converted Odds
        </h3>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-500">Decimal</dt>
            <dd className="text-xl font-bold text-slate-900">
              {decimal > 0 ? decimal.toFixed(2) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">American</dt>
            <dd className="text-xl font-bold text-slate-900">
              {decimal > 0 ? formatAmerican(american) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Fractional</dt>
            <dd className="text-xl font-bold text-slate-900">
              {decimal > 0 ? formatFractional(frac.num, frac.den) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Implied probability</dt>
            <dd className="text-xl font-bold text-slate-900">
              {decimal > 0 ? `${implied.toFixed(1)}%` : "—"}
            </dd>
          </div>
        </dl>
      </div>

      <section className="mt-10 border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold text-slate-900">How to use the Odds Converter</h3>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-slate-600">
          <li>Select the format of the odds you have (Decimal, American, or Fractional).</li>
          <li>Enter your odds in the input field. The converter updates instantly.</li>
          <li>All other formats and implied probability appear in the results box.</li>
        </ol>
        <h4 className="mt-4 font-medium text-slate-800">What to look for</h4>
        <ul className="mt-2 list-inside space-y-1 text-sm text-slate-600">
          <li><strong>Implied probability</strong> — Shows the bookmaker&apos;s implied chance of the outcome. Compare across sportsbooks to spot better value.</li>
          <li><strong>Format consistency</strong> — UK and European sites use decimal; US sites use American (+/-); some use fractional. Use this tool to compare apples to apples.</li>
          <li><strong>Value hunting</strong> — If you believe the true probability is higher than the implied %, you may have found a value bet.</li>
        </ul>
      </section>
    </div>
  );
}
