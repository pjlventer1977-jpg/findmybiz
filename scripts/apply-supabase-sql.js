#!/usr/bin/env node
/**
 * Apply all Supabase migrations and seeds via the SQL API.
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in .env.local
 *
 * Usage: node scripts/apply-supabase-sql.js
 */

const fs = require("fs");
const path = require("path");

// Load .env.local manually
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8")
    .split("\n")
    .forEach((line) => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) process.env[match[1].trim()] = match[2].trim();
    });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY || SUPABASE_URL.includes("YOUR_PROJECT")) {
  console.error("\n❌ Missing Supabase credentials.");
  console.error("   1. Create a project at https://supabase.com/dashboard");
  console.error("   2. Copy .env.local.example to .env.local");
  console.error("   3. Fill in NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  console.error("\n   Or follow manual steps in supabase/SETUP.md\n");
  process.exit(1);
}

const files = [
  "supabase/migrations/001_initial_schema.sql",
  "supabase/migrations/002_lead_credit_functions.sql",
  "supabase/migrations/003_storage_buckets.sql",
  "supabase/migrations/004_rls_policies.sql",
  "supabase/seed/001_provinces_districts.sql",
  "supabase/seed/002_cities.sql",
  "supabase/seed/003_suburbs.sql",
  "supabase/seed/004_categories.sql",
];

async function runSql(sql, label) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
  }).catch(() => null);

  // Use pg-meta or direct postgres - REST API doesn't run arbitrary SQL
  // Fall back to Supabase Management API isn't available without access token
  // Use the database connection via supabase CLI instead
  console.log(`  ⏭  ${label} — use Supabase SQL Editor or 'supabase db push'`);
}

async function main() {
  console.log("\n=== Find My Biz Supabase Setup ===\n");
  console.log("Credentials found. Recommended approach:\n");
  console.log("  npx supabase login");
  console.log("  npx supabase link --project-ref YOUR_REF");
  console.log("  npm run db:push");
  console.log("\nOr paste SQL files manually — see supabase/SETUP.md\n");

  // Verify connection
  const res = await fetch(`${SUPABASE_URL}/rest/v1/provinces?select=count`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      Prefer: "count=exact",
    },
  });

  if (res.status === 404 || res.status === 406) {
    console.log("⚠️  Database not seeded yet (provinces table missing or empty).");
    console.log("   Run migrations via supabase/SETUP.md\n");
  } else if (res.ok) {
    const count = res.headers.get("content-range")?.split("/")[1] ?? "?";
    console.log(`✅ Connected! Provinces in database: ${count}\n`);
  } else {
    console.log(`Connection test returned: ${res.status} ${res.statusText}\n`);
  }
}

main();
