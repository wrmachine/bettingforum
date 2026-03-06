import { headers } from "next/headers";

/**
 * Get the base URL for the current request.
 * Uses the request host when available (so internal fetches work when app runs on non-default port).
 */
export async function getBaseUrl(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get("host");
    const proto = h.get("x-forwarded-proto") || "http";
    if (host) {
      return `${proto}://${host}`;
    }
  } catch {
    // headers() can throw in edge cases
  }
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}
