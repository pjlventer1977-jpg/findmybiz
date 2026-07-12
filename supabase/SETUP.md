# Supabase Setup — Step 3

Complete guide to set up the Find My Biz database on Supabase.

## Option A: Supabase Dashboard (No CLI required)

### 1. Create your project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Name: `findmybiz`
4. Choose region: **South Africa (Cape Town)** if available, otherwise closest region
5. Set a strong database password and save it securely
6. Wait for the project to finish provisioning (~2 minutes)

### 2. Run migrations

1. Open **SQL Editor** in your Supabase dashboard
2. Run each migration file **in order** (copy/paste full file contents):
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_lead_credit_functions.sql`
   - `supabase/migrations/003_storage_buckets.sql`
   - `supabase/migrations/004_rls_policies.sql`
3. Click **Run** after each file — wait for success before the next

### 3. Run seed data

Run each seed file in order in the SQL Editor:
   - `supabase/seed/001_provinces_districts.sql`
   - `supabase/seed/002_cities.sql`
   - `supabase/seed/003_suburbs.sql`
   - `supabase/seed/004_categories.sql`

### 4. Configure environment variables

1. Go to **Project Settings → API**
2. Copy **Project URL** and **anon public** key
3. Copy **service_role** key (keep secret — server only)
4. Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Enable Auth

1. Go to **Authentication → Providers**
2. Ensure **Email** is enabled
3. Under **URL Configuration**, set:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/**`

### 6. Verify setup

Run this in SQL Editor:

```sql
SELECT (SELECT COUNT(*) FROM provinces) AS provinces,
       (SELECT COUNT(*) FROM cities) AS cities,
       (SELECT COUNT(*) FROM suburbs) AS suburbs,
       (SELECT COUNT(*) FROM categories) AS categories,
       (SELECT COUNT(*) FROM storage.buckets) AS buckets;
```

Expected: 9 provinces, 150+ cities, 80+ suburbs, 250+ categories, 5 buckets.

---

## Option B: Supabase CLI (Recommended for developers)

### Prerequisites

- Node.js 18+
- Supabase CLI: `npm install -g supabase`

### Steps

```powershell
cd "C:\Users\tech_\OneDrive\Documents\Curson Projects\FindMyBiz"

# Login to Supabase
supabase login

# Link to your project (find ref in Dashboard → Settings → General)
supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
supabase db push

# Run seeds via SQL Editor (CLI seed requires config) or:
Get-Content supabase\seed\001_provinces_districts.sql | supabase db execute
Get-Content supabase\seed\002_cities.sql | supabase db execute
Get-Content supabase\seed\003_suburbs.sql | supabase db execute
Get-Content supabase\seed\004_categories.sql | supabase db execute
```

Or use the setup script:

```powershell
.\scripts\setup-supabase.ps1 -ProjectRef YOUR_PROJECT_REF
```

---

## Create your first admin user

1. Register at `http://localhost:3000/login`
2. In Supabase SQL Editor:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

---

## Storage buckets created

| Bucket | Public | Purpose |
|--------|--------|---------|
| business-logos | Yes | Company logos |
| business-documents | No | Verification docs (ID, CIPC, proof of address) |
| portfolio-images | Yes | Professional tier gallery |
| event-banners | Yes | Event listing banners |
| special-images | Yes | Specials/promotions images |

---

## Troubleshooting

**`uuid-ossp` extension error:** Supabase enables this by default; skip the CREATE EXTENSION line if it fails.

**Duplicate key on seed:** Seeds were already run — safe to ignore or truncate tables first.

**RLS blocking inserts:** Business registration uses the anon key + authenticated user; ensure Auth is configured and user is logged in.

**PayFast webhooks:** Set `NEXT_PUBLIC_APP_URL` to your production URL before going live.
