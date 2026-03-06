/**
 * Product types: brands can be any or all of these.
 * Stored as JSON array in DB, e.g. ["sportsbook","casino"].
 * Legacy single string "sportsbook" is supported when parsing.
 */
export const PRODUCT_TYPES = ["sportsbook", "casino", "crypto", "tool", "tipster"] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

const VALID = new Set(PRODUCT_TYPES);

/** Parse productType from DB (supports legacy single string or JSON array) */
export function parseProductTypes(val: string | null | undefined): ProductType[] {
  if (!val?.trim()) return ["sportsbook"];
  const s = val.trim();
  if (s.startsWith("[")) {
    try {
      const arr = JSON.parse(s) as unknown;
      if (Array.isArray(arr)) {
        return arr.filter((t): t is ProductType => typeof t === "string" && VALID.has(t as ProductType));
      }
    } catch {
      /* fall through */
    }
  }
  return VALID.has(s as ProductType) ? [s as ProductType] : ["sportsbook"];
}

/** Serialize product types for DB storage */
export function serializeProductTypes(types: ProductType[]): string {
  const valid = types.filter((t) => VALID.has(t));
  return valid.length > 0 ? JSON.stringify([...new Set(valid)]) : JSON.stringify(["sportsbook"]);
}

/** Format product types for display (e.g. "Sportsbook, Casino") */
export function formatProductTypesDisplay(types: ProductType[]): string {
  return types
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
    .join(", ");
}

/** Check if a product's types include a given filter type (for API filtering) */
export function productTypesInclude(stored: string | null | undefined, filterType: string): boolean {
  const types = parseProductTypes(stored);
  return types.includes(filterType as ProductType);
}
