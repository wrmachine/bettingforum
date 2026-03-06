# Betting Forum — Deployment & Performance Guide

A reference document for deployment options, performance improvements, and architecture decisions.

---

## Tech Stack (Current)

| Component | Technology |
|-----------|------------|
| Framework | Next.js 15 (App Router) |
| Database | SQLite (dev) / PostgreSQL (production recommended) |
| ORM | Prisma |
| Auth | next-auth v4 |
| UI | React 18, Tailwind CSS |
| Content | react-markdown |
| Fonts | Inter, Playfair Display (`next/font`) |

---

## Performance Analysis

### Main Bottlenecks

1. **Root layout `force-dynamic`** — Every page is server-rendered on each request; no static/ISR optimization for most routes.

2. **Database calls on every request** — Layout makes 4–5 DB calls per page load:
   - `getGlobalSeoSettings`
   - `getSchemaEnabled` (called twice)
   - `buildMetadata` (calls both again)

3. **Client-side fetch waterfalls** — Multiple components fetch on mount instead of server data:
   - Navbar: 2 menu endpoints
   - FooterDirectory: 4 menu endpoints
   - ProductsIndex, ThreadsIndex, ArticlesPage: each fetches posts on mount
   - HomeSidebar: user stats when logged in

4. **Inefficient queries** — `getPopularThreads` loads 100 rows, sorts in JS, slices; comments API loads all at once with no pagination; sitemap loads all published posts.

5. **Unoptimized images** — Articles use raw `<img>` instead of `next/image`.

### Quick Wins (No Stack Change)

| Change | Impact |
|--------|--------|
| Cache SEO/schema in layout (`unstable_cache`, 5–15 min TTL) | High — reduces 4–5 DB calls to 0 after first hit |
| Preload menus in layout (SSR), pass as props | High — eliminates 6 client fetches |
| Remove or narrow root `force-dynamic` | High — enables static/ISR for many pages |
| Sort popularity in DB (not JS) | Medium |
| Paginate comments API | Medium |
| Swap article `<img>` for `next/image` | Medium |

---

## Rails vs Next.js (Summary)

- **Performance:** Fixing the architecture in Next.js will get you most of the benefit; Rails is not inherently faster.
- **Deployment:** Rails has strong conventions, but both stacks deploy easily. Migration effort to Rails is high; deployment benefit is low.
- **Verdict:** Stay with Next.js unless you have other reasons to switch.

---

## Environment Variables (Production)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Database connection string |
| `NEXTAUTH_SECRET` | Auth signing secret — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Production URL (e.g. `https://yoursite.com`) |
| `ANTHROPIC_API_KEY` | Optional — for admin AI/Claude features only |

---

## Database: SQLite vs PostgreSQL

- **SQLite:** Fine for dev; use with persistent volume if keeping it in production.
- **PostgreSQL:** Recommended for production — better concurrency, indexes, and hosting support.
- **Prisma switch:** Change `provider` in `prisma/schema.prisma` to `"postgresql"`, then run `prisma migrate dev` or `prisma db push`.

---

## Deployment Options

### General Flow (Any Host)

1. Provision a database (Postgres recommended).
2. Set env vars: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.
3. Run `prisma db push` or `prisma migrate deploy`.
4. Build: `npm run build`
5. Run: `npm run start`
6. Configure DNS / SSL as needed.

---

## AWS Deployment (All In-House)

User preference: minimal external services; keep everything in AWS.

### Option A: Single EC2 Instance (Simplest)

- **Services:** EC2 only (app + SQLite or Postgres on same box).
- **Steps:**
  1. Launch Ubuntu EC2 (e.g. `t3.small`).
  2. Install Node.js, Postgres (or keep SQLite), nginx.
  3. Clone repo, `npm install`, `npm run build`, `npm start`.
  4. Configure nginx as reverse proxy to port 3000.
  5. Optional: Route 53 for DNS, ACM for SSL.
- **Cost:** ~$10–20/month.
- **Pros:** One service, lowest cost.
- **Cons:** Manual updates and backups; no auto-scaling.

### Option B: EC2 + RDS

- **Services:** EC2 (app) + RDS Postgres.
- **Cost:** ~$25–40/month.
- **Pros:** Managed DB, backups, separation of app and data.

### Option C: Lightsail

- **Services:** Lightsail Container/Instance + Lightsail Database.
- **Pros:** Simple UI, predictable pricing, all AWS.

### Option D: Amplify + RDS

- **Services:** Amplify (hosting) + RDS (Postgres).
- **Pros:** Managed build, Git-based deploys.
- **Cons:** Higher cost (~$30–80/month combined).

### Recommended: Single EC2

- Single Ubuntu instance running Next.js and DB.
- Optional: Route 53, ACM for domain and HTTPS.
- Good balance of simplicity and cost for an all-AWS setup.

---

## File References

- **Env template:** `.env.example`
- **Prisma schema:** `prisma/schema.prisma`
- **Layout (force-dynamic):** `src/app/layout.tsx`
- **Posts/queries:** `src/lib/posts.ts`
- **SEO helpers:** `src/lib/seo.ts`
- **Menu components:** Navbar, FooterDirectory

---

*Last updated: March 2025*
