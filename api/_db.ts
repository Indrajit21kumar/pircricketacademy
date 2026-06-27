import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../server/db/schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Strip unsupported channel_binding param from Neon serverless HTTP client
const dbUrl = process.env.DATABASE_URL.replace(/[&?]channel_binding=[^&]*/g, "");

const sql = neon(dbUrl);
export const db = drizzle(sql, { schema });
