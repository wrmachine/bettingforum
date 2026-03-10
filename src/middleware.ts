import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";

const SUPREME_ADMIN_EMAIL = "partners@wrmachine.com";

const AUTH_MIDDLEWARE = withAuth({
  callbacks: {
    authorized: async ({ token }) => {
      if (!token) return false;
      return token.role === "admin" || token.email === SUPREME_ADMIN_EMAIL;
    },
  },
  pages: { signIn: "/auth/sign-in" },
});

// In-memory cache for redirect map (per Edge isolate)
let redirectCache: { redirects: { from: string; to: string }[]; ts: number } | null = null;
const CACHE_TTL_MS = 60_000; // 1 minute

async function getRedirectMap(origin: string): Promise<{ from: string; to: string }[]> {
  if (redirectCache && Date.now() - redirectCache.ts < CACHE_TTL_MS) {
    return redirectCache.redirects;
  }
  try {
    const url = `${origin}/api/redirects/map`;
    const res = await fetch(url);
    const data = (await res.json()) as { redirects?: { from: string; to: string }[] };
    const redirects = Array.isArray(data?.redirects) ? data.redirects : [];
    redirectCache = { redirects, ts: Date.now() };
    return redirects;
  } catch {
    return redirectCache?.redirects ?? [];
  }
}

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Skip redirect check for api, _next, static, favicon, admin (auth handles admin)
  const skipRedirect =
    path.startsWith("/api/") ||
    path.startsWith("/_next/") ||
    path.startsWith("/favicon") ||
    path === "/api/redirects/map" ||
    path.startsWith("/admin");

  if (!skipRedirect) {
    const origin = req.nextUrl.origin;
    const redirects = await getRedirectMap(origin);

    for (const r of redirects) {
      if (r.from === path) {
        return NextResponse.redirect(new URL(r.to, origin), 301);
      }
    }
  }

  // Admin routes: run auth
  if (path.startsWith("/admin")) {
    return (AUTH_MIDDLEWARE as (req: NextRequest) => Promise<NextResponse>)(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
