import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../server/db/schema";

// Strip unsupported params (channel_binding) from connection string
const rawUrl = process.env.DATABASE_URL!;
const dbUrl = rawUrl.replace(/[&?]channel_binding=[^&]*/g, "");

const sql = neon(dbUrl);
export const db = drizzle(sql, { schema });
