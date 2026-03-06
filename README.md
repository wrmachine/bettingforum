# Betting Forum

A community-driven platform for discovering and reviewing betting products: sportsbooks, casinos, crypto betting, tools, and tipsters.

## Stack

- **Frontend/Backend**: Next.js 15 (App Router, TypeScript, React)
- **Database**: PostgreSQL (RDS on AWS)
- **ORM**: Prisma
- **Auth**: NextAuth (email + OAuth ready)
- **Deployment**: AWS (App Runner/Amplify), CloudFront + Route 53

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   Copy `.env.example` to `.env` and set:

   - `DATABASE_URL` – PostgreSQL connection string
   - `NEXTAUTH_SECRET` – Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` – e.g. `http://localhost:3000`

3. **Initialize database**

   Ensure PostgreSQL is running (e.g. via Docker: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres`).

   ```bash
   npm run db:push
   npm run db:generate
   npm run db:seed
   ```

   The seed creates 4 users, 5 forum threads, 3 products, 1 listicle, plus votes, comments, and reviews.

4. **Run development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/              # App Router pages & API routes
├── components/       # React components
├── lib/              # Utilities (Prisma, auth, slug)
└── types/            # TypeScript declarations
prisma/
└── schema.prisma     # Database schema
```

## Pages

- `/` – Home (hero + top products by time range + trending threads)
- `/products` – Products index (filters, sort)
- `/products/[slug]` – Product detail (info, reviews, discussion)
- `/listicles` – Listicles index
- `/listicles/[slug]` – Listicle detail
- `/threads` – Forum threads
- `/threads/[slug]` – Thread detail + comments
- `/categories` – Category directory
- `/auth/sign-in`, `/auth/sign-up` – Auth
- `/u/[username]` – User profile
- `/account` – Account settings
- `/submit` – Submission type picker
- `/admin` – Admin shell

## API

- `GET/POST /api/posts` – List/create posts
- `GET /api/posts/[slug]` – Single post
- `POST /api/posts/[id]/vote` – Toggle vote
- `GET/POST /api/posts/[id]/comments` – Comments
- `GET/POST /api/products/[id]/reviews` – Reviews
- `POST /api/listicles` – Create listicle

## License

Private.
