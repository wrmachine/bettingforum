# Internal Server Error – Root Cause Analysis

## Summary

500 errors occur when **uncaught exceptions** happen during server-side rendering. Several pages and flows don't wrap risky logic in try-catch, so any throw becomes an Internal Server Error.

---

## 1. Page Components Without Error Handling

These pages call `getBaseUrl()`, `getSchemaEnabled()`, and schema builders **without try-catch**. Any thrown error in that chain becomes a 500:

| Page | generateMetadata | Main Page Logic |
|------|------------------|-----------------|
| **Products** | ❌ No try-catch | ✅ Has try-catch |
| **Articles** | ✅ Has try-catch | ❌ No try-catch |
| **Threads** | ✅ Has try-catch | ❌ No try-catch |
| **Bonuses** | ❌ No try-catch | ❌ No try-catch |
| **Listicles** | ❌ No try-catch | ❌ No try-catch |

---

## 2. What Can Throw?

- **`getBaseUrl()`** – Uses `headers()` from Next.js. Can throw in some edge cases (static generation, cold starts, certain runtimes).
- **`buildMetadata()`** – Uses Prisma (`getGlobalSeoSettings`, `getPageMeta`). Throws if DB is unreachable or tables are missing.
- **`getSchemaEnabled()`** – Prisma call. Same risk.
- **Schema builders** (`buildProductSchema`, `buildOfferSchema`, etc.) – Sync functions that could throw on malformed data.
- **`JSON.parse()`** – In `seo.ts` for `robotsDisallowPaths`. Inner try-catch exists, but the pattern repeats elsewhere.

---

## 3. Self-Fetch Pattern

All dynamic pages fetch `${base}/api/posts/${slug}`. Risks:

- **Wrong `base` URL** – In serverless, `base` might point to a URL the server can’t reach.
- **API returns 500** – If `/api/posts/[slug]` fails (e.g. Prisma error), the page receives an error body. The `getXxx` functions treat non-ok responses as null and call `notFound()`, so this usually leads to 404, not 500.
- **Fetch throws** – `getXxx` has try-catch and returns null → `notFound()`.

---

## 4. Client Components

Client components (e.g. `ProductDetail`, `BonusDetail`) can crash on bad or missing data if they access nested properties without guards. A null check was added for `ProductDetail` when `post.product` is null.

---

## 5. API Routes

Most API routes have try-catch and return structured errors. Exceptions are mostly in page rendering and metadata generation, not in the APIs themselves.

---

## Recommendations

1. **Wrap generateMetadata in try-catch** for Products, Bonuses, and Listicles (like Articles and Threads).
2. **Wrap main page logic in try-catch** for Articles, Threads, Bonuses, and Listicles.
3. **Add an `error.tsx` in `app/`** – Global error boundary to show a friendly error UI instead of a raw 500.
4. **Check server logs** – Run `npm run dev` and reproduce the error; the stack trace will identify the exact throw.
5. **Verify database** – Ensure `DATABASE_URL` is correct, migrations are applied, and SQLite file isn’t locked.
