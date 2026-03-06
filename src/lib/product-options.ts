/**
 * Product review options for banking and crypto methods.
 * AI-friendly: Use these exact `id` values when updating product.bankingMethods or product.cryptoMethods.
 *
 * To add banking: bankingMethods = [{ id: "visa", deposit: { min: 10, max: 30000, fee: "FREE" }, withdrawal: { fee: "FREE" } }]
 * To add crypto: cryptoMethods = [{ id: "bitcoin" }, { id: "ethereum" }]
 */

export interface BankingMethodDeposit {
  min?: number;
  max?: number;
  fee?: string;
}

export interface BankingMethodWithdrawal {
  fee?: string;
}

export interface BankingMethodEntry {
  id: string;
  deposit?: BankingMethodDeposit;
  withdrawal?: BankingMethodWithdrawal;
}

export interface CryptoMethodEntry {
  id: string;
  name?: string;
}

export const BANKING_OPTIONS: Record<
  string,
  { name: string; displayName: string; color?: string }
> = {
  visa: { name: "Visa", displayName: "Visa", color: "#1a1f71" },
  mastercard: { name: "Mastercard", displayName: "Mastercard", color: "#eb001b" },
  paypal: { name: "PayPal", displayName: "PayPal", color: "#003087" },
  banktransfer: { name: "Bank Transfer", displayName: "Bank Transfer", color: "#4a5568" },
  paynearme: { name: "PayNearMe", displayName: "PayNearMe", color: "#e31937" },
  skrill: { name: "Skrill", displayName: "Skrill", color: "#8f2f92" },
  paysafecard: { name: "Paysafecard", displayName: "Paysafecard", color: "#00a651" },
  cash: { name: "Cash", displayName: "Cash", color: "#22c55e" },
  maestro: { name: "Maestro", displayName: "Maestro", color: "#0099df" },
  trustly: { name: "Trustly", displayName: "Trustly", color: "#0ee06e" },
  applepay: { name: "Apple Pay", displayName: "Apple Pay", color: "#000000" },
  googlepay: { name: "Google Pay", displayName: "Google Pay", color: "#4285f4" },
};

export const CRYPTO_OPTIONS: Record<
  string,
  { name: string; symbol: string; color?: string }
> = {
  bitcoin: { name: "Bitcoin", symbol: "BTC", color: "#f7931a" },
  ethereum: { name: "Ethereum", symbol: "ETH", color: "#627eea" },
  litecoin: { name: "Litecoin", symbol: "LTC", color: "#345d9d" },
  usdt: { name: "Tether", symbol: "USDT", color: "#26a17b" },
  usdc: { name: "USD Coin", symbol: "USDC", color: "#2775ca" },
  dogecoin: { name: "Dogecoin", symbol: "DOGE", color: "#c2a633" },
  bitcoin_cash: { name: "Bitcoin Cash", symbol: "BCH", color: "#8dc351" },
};

export function parseBankingMethods(json: string | null): BankingMethodEntry[] {
  if (!json || typeof json !== "string") return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseCryptoMethods(json: string | null): CryptoMethodEntry[] {
  if (!json || typeof json !== "string") return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseAcceptedCurrencies(json: string | null): string[] {
  if (!json || typeof json !== "string") return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : typeof parsed === "string" ? parsed.split(",").map((s: string) => s.trim()) : [];
  } catch {
    if (typeof json === "string" && json.includes(",")) return json.split(",").map((s) => s.trim());
    return json ? [String(json)] : [];
  }
}
