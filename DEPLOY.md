# Deploy Betting Forum to Vercel

## Prerequisites

- [Vercel account](https://vercel.com)
- [Neon](https://neon.tech) (free PostgreSQL) or another hosted Postgres
- Git

---

## 1. Create a PostgreSQL database

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the **connection string** (starts with `postgresql://`)
4. Use the **pooled** connection string for serverless (usually port 5432 or 6543)

---

## 2. Set up environment variables on Vercel

Before deploying, add these in [Vercel Dashboard](https://vercel.com) → Project → Settings → Environment Variables:

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | ✅ | Postgres connection string from Neon |
| `NEXTAUTH_SECRET` | ✅ | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | ✅ | `https://your-domain.vercel.app` (update after first deploy) |
| `ANTHROPIC_API_KEY` | For AI features | From console.anthropic.com |
| `CRON_SECRET` | For AI bots cron | `openssl rand -hex 32` |
| `GOOGLE_CLIENT_ID` | Optional | For Google sign-in |
| `GOOGLE_CLIENT_SECRET` | Optional | For Google sign-in |
| `RESEND_API_KEY` | Optional | For email verification |
| `EMAIL_FROM` | Optional | Sender email |

---

## 3. Deploy

### Option A: Vercel CLI (quickest)

```bash
npm i -g vercel
vercel
```

Follow the prompts. Vercel will link the project and deploy.

### Option B: Git + Vercel

1. Initialize and push to GitHub:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/betting-forum.git
   git push -u origin main
   ```

2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repo
4. Add environment variables (Step 2 above)
5. Deploy

---

## 4. After first deploy

1. **Update `NEXTAUTH_URL`** in Vercel env to your live URL (e.g. `https://betting-forum-xxx.vercel.app`)

2. **Seed the database** (optional – creates sample data):

   ```bash
   DATABASE_URL="your-neon-connection-string" npm run db:seed
   ```

3. **Configure Google OAuth** (if using): Add your production callback URL to [Google Console](https://console.cloud.google.com/apis/credentials):
   - `https://your-domain.vercel.app/api/auth/callback/google`

---

## Local development with Postgres

Since the project uses PostgreSQL (required for Vercel), use one of:

- **Neon** – Create a second database for dev, or use the same
- **Docker** – `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres`
- **Local Postgres** – If installed

Update `.env`:

```
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

Then:

```bash
npm run db:push
npm run db:seed
npm run dev
```
