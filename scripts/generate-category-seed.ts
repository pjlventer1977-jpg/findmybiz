/**
 * Regenerates supabase/seed/004_categories.sql from sa-category-taxonomy.ts
 * Usage: npx tsx scripts/generate-category-seed.ts
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  SA_CATEGORY_TAXONOMY,
  getTaxonomyStats,
} from "../src/data/sa-category-taxonomy";

const stats = getTaxonomyStats();
const lines: string[] = [
  "-- Find My Biz South Africa category taxonomy",
  "-- Generated from src/data/sa-category-taxonomy.ts",
  `-- Parents: ${stats.parents} | Subcategories: ${stats.children} | Total: ${stats.total}`,
  "-- Regenerate: npx tsx scripts/generate-category-seed.ts",
  "",
  "-- Parent categories",
  "INSERT INTO categories (name, slug, description, sort_order) VALUES",
];

const parentValues = SA_CATEGORY_TAXONOMY.map(
  (p, i) =>
    `  ('${escapeSql(p.name)}', '${p.slug}', '${escapeSql(p.description)}', ${i + 1})`
);
lines.push(parentValues.join(",\n") + ";");
lines.push("");

for (const parent of SA_CATEGORY_TAXONOMY) {
  lines.push(`-- Subcategories: ${parent.name}`);
  lines.push("INSERT INTO categories (parent_id, name, slug, sort_order)");
  lines.push("SELECT p.id, s.name, s.slug, s.ord FROM categories p,");
  lines.push("(VALUES");
  const childValues = parent.children.map(
    (c, i) => `  ('${escapeSql(c.name)}', '${c.slug}', ${i + 1})`
  );
  lines.push(childValues.join(",\n"));
  lines.push(`) AS s(name, slug, ord) WHERE p.slug = '${parent.slug}';`);
  lines.push("");
}

const outPath = join(process.cwd(), "supabase/seed/004_categories.sql");
writeFileSync(outPath, lines.join("\n") + "\n", "utf8");
console.log(`Wrote ${outPath} (${stats.parents} parents, ${stats.children} children)`);

function escapeSql(value: string): string {
  return value.replace(/'/g, "''");
}
