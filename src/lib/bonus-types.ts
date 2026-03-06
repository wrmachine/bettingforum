/**
 * Canonical bonus code types — used for AI tagging and filtering.
 * Based on industry standards: first deposit, second deposit, reload, no deposit, etc.
 */
export const BONUS_TYPES = [
  { slug: "first-time", label: "First Time Deposit" },
  { slug: "second-deposit", label: "Second Deposit" },
  { slug: "third-deposit", label: "Third Deposit" },
  { slug: "reload", label: "Reload" },
  { slug: "no-deposit", label: "No Deposit" },
  { slug: "free-spins", label: "Free Spins" },
  { slug: "cashback", label: "Cashback" },
  { slug: "loyalty", label: "Loyalty / VIP" },
  { slug: "high-roller", label: "High Roller" },
  { slug: "referral", label: "Referral" },
  { slug: "birthday", label: "Birthday" },
  { slug: "welcome", label: "Welcome Package" },
] as const;

export type BonusTypeSlug = (typeof BONUS_TYPES)[number]["slug"];

export const BONUS_TYPE_SLUGS = BONUS_TYPES.map((t) => t.slug);

export function getBonusTypeLabel(slug: string): string {
  return BONUS_TYPES.find((t) => t.slug === slug)?.label ?? slug;
}
