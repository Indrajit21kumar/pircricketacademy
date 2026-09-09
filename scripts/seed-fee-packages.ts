/**
 * One-time seed: creates the fee_packages table and inserts 3 default packages.
 * Run with: npx tsx scripts/seed-fee-packages.ts
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Raw SQL approach — avoids needing to import the full schema
async function main() {
  const conn = sql;

  await conn(`
    CREATE TABLE IF NOT EXISTS fee_packages (
      id         SERIAL PRIMARY KEY,
      months     INTEGER NOT NULL UNIQUE,
      label      TEXT NOT NULL,
      discount_pct INTEGER NOT NULL,
      is_active  BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  console.log("Table fee_packages ensured.");

  // Insert defaults only if table is empty
  const existing = await conn(`SELECT COUNT(*) as c FROM fee_packages`);
  const count = parseInt((existing[0] as any).c ?? "0", 10);
  if (count === 0) {
    await conn(`
      INSERT INTO fee_packages (months, label, discount_pct, is_active, sort_order) VALUES
        (3,  '3-Month Pack',  10, true, 1),
        (6,  '6-Month Pack',  15, true, 2),
        (12, '12-Month Pack', 20, true, 3)
    `);
    console.log("Seeded 3 default fee packages.");
  } else {
    console.log(`Skipped seed — ${count} package(s) already exist.`);
  }

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
