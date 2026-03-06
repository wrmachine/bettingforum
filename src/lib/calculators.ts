/**
 * Shared utilities for betting calculators
 */

export type OddsFormat = "decimal" | "fractional" | "american";

/** Convert decimal odds to implied probability (0–1) */
export function decimalToImplied(dec: number): number {
  if (dec <= 0) return 0;
  return 1 / dec;
}

/** Convert implied probability (0–1) to decimal odds */
export function impliedToDecimal(implied: number): number {
  if (implied <= 0 || implied >= 1) return 0;
  return 1 / implied;
}

/** Decimal <-> American */
export function decimalToAmerican(dec: number): number {
  if (dec <= 0) return 0;
  if (dec >= 2) return Math.round((dec - 1) * 100);
  return Math.round(-100 / (dec - 1));
}

export function americanToDecimal(am: number): number {
  if (am >= 100) return 1 + am / 100;
  if (am <= -100) return 1 + 100 / Math.abs(am);
  return 0;
}

/** Decimal <-> Fractional (e.g. 2.5 -> 3/2) */
export function decimalToFractional(dec: number): { num: number; den: number } {
  if (dec <= 0) return { num: 0, den: 1 };
  const den = 1000;
  const num = Math.round((dec - 1) * den);
  const g = gcd(num, den);
  return { num: num / g, den: den / g };
}

export function fractionalToDecimal(num: number, den: number): number {
  if (den <= 0) return 0;
  return 1 + num / den;
}

function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

/** Format fractional display */
export function formatFractional(num: number, den: number): string {
  if (den === 1) return String(num);
  return `${num}/${den}`;
}

/** Format American with +/- */
export function formatAmerican(n: number): string {
  if (n > 0) return `+${n}`;
  return String(n);
}

// Calculator definitions
export interface CalculatorDef {
  slug: string;
  name: string;
  description: string;
  category: "essential" | "advanced";
}

export const CALCULATORS: CalculatorDef[] = [
  {
    slug: "odds-converter",
    name: "Odds Converter",
    description: "Convert between decimal, fractional, and American odds instantly.",
    category: "essential",
  },
  {
    slug: "parlay",
    name: "Parlay Calculator",
    description: "Calculate combined odds, potential profit, and payout for multi-leg bets.",
    category: "essential",
  },
  {
    slug: "roi",
    name: "ROI Calculator",
    description: "Compute return on investment, profit, and loss for individual bets.",
    category: "essential",
  },
  {
    slug: "break-even",
    name: "Break-Even Calculator",
    description: "Find the win rate you need to break even at any odds. Essential for value betting.",
    category: "essential",
  },
  {
    slug: "ev",
    name: "Expected Value (EV) Calculator",
    description: "Determine if a bet has positive expected value. Compare your edge vs. the odds.",
    category: "essential",
  },
  {
    slug: "hedge",
    name: "Hedge Calculator",
    description: "Calculate optimal hedge stakes to lock in profit on parlays, futures, or live bets.",
    category: "advanced",
  },
  {
    slug: "kelly",
    name: "Kelly Criterion Calculator",
    description: "Optimal bet sizing to maximize long-term bankroll growth. Use half-Kelly to reduce variance.",
    category: "advanced",
  },
  {
    slug: "arbitrage",
    name: "Arbitrage Calculator",
    description: "Find surebet opportunities and optimal stake distribution across outcomes.",
    category: "advanced",
  },
  {
    slug: "no-vig",
    name: "No-Vig Calculator",
    description: "Remove the vig from two-way odds to see fair probabilities and true market value.",
    category: "advanced",
  },
  {
    slug: "teaser",
    name: "Teaser Calculator",
    description: "Calculate payouts for 6-point, 6.5-point, and 7-point NFL and NBA teasers.",
    category: "advanced",
  },
  {
    slug: "bankroll",
    name: "Bankroll Calculator",
    description: "Determine bet sizing, variance, and risk using unit-based bankroll management.",
    category: "advanced",
  },
];

export function getCalculator(slug: string): CalculatorDef | undefined {
  return CALCULATORS.find((c) => c.slug === slug);
}
