# Find My Biz — South Africa Business Directory

**Get found. Get verified. Get leads.**

A nationwide business directory and lead generation platform for South African businesses, covering all 9 provinces.

Domain: [findmybiz.co.za](https://findmybiz.co.za)

## Features

- **QuoteMatch Lead Engine** — Customers request quotes; platform routes to up to 5 verified businesses
- **BizTrust Score (0–100)** — Composite trust badge based on verification, reviews, and response rate
- **WhatsApp Lead Cards** — Instant formatted lead notifications via WhatsApp
- **Local Champion Slots** — Premium category exclusivity per area (max 3 per category)
- **Demand Insights Dashboard** — Search and profile view analytics
- **Digital BizCard QR** — Printable QR linking to business profile
- **Specials Board & Events Hub** — Promotions and paid event listings
- **Full SA Coverage** — 9 provinces, 52 districts, 150+ cities, metro suburbs
- **PayFast Integration** — Subscriptions, lead credits, event payments

## Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Storage, RLS)
- **Payments:** PayFast
- **Hosting:** Vercel + Supabase Cloud

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase account
- PayFast merchant account (sandbox for testing)

### Setup

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment**

```bash
cp .env.example .env.local
```

Fill in your Supabase and PayFast credentials.

3. **Set up Supabase** — see detailed guide: [`supabase/SETUP.md`](supabase/SETUP.md)

   **Quick start (CLI):**
   ```bash
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npm run db:push
   npm run setup:supabase
   ```

   **Or dashboard:** Run the 4 migration files + 4 seed files in SQL Editor (order matters).

   Copy `.env.local.example` → `.env.local` and add your API keys.

4. **Run development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Admin Access

Set a user's role to `admin` in the `profiles` table:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

## Membership Tiers

| Tier | Price | Leads/mo | Specials/mo |
|------|-------|----------|-------------|
| Free | R0 | 1 | 0 |
| Starter | R149 | 3 | 2 |
| Professional | R299 | 10 | 5 |
| Enterprise | R500 | 20 | Unlimited |

## Deployment

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Point `findmybiz.co.za` DNS to Vercel:
   - `A` record → `76.76.21.21`
   - `CNAME` www → `cname.vercel-dns.com`

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── api/          # API routes (quotes, payfast, biz-trust)
│   ├── dashboard/    # Business owner portal
│   ├── admin/        # Admin panel
│   └── [province]/   # SEO location pages
├── components/       # UI and layout components
├── lib/              # Utilities, Supabase, lead router, PayFast
├── constants/        # Membership plans, pricing
└── types/            # TypeScript types
supabase/
├── migrations/       # Database schema
└── seed/             # SA locations and categories
```

## License

Proprietary — Find My Biz © 2026
