import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const result: Record<string, any> = {
    ok: true,
    time: new Date().toISOString(),
    hasDb: !!process.env.DATABASE_URL,
  };

  // Step 1: can we import neon?
  try {
    const { neon } = await import("@neondatabase/serverless");
    result.neonImport = "ok";

    // Step 2: can we create neon client?
    const dbUrl = (process.env.DATABASE_URL || "").replace(/[&?]channel_binding=[^&]*/g, "");
    const sql = neon(dbUrl);
    result.neonClient = "ok";

    // Step 3: can we import drizzle?
    const { drizzle } = await import("drizzle-orm/neon-http");
    result.drizzleImport = "ok";

    // Step 4: can we import schema?
    const schema = await import("../server/db/schema.js");
    result.schemaImport = "ok";

    // Step 5: can we create db?
    const db = drizzle(sql, { schema });
    result.dbInit = "ok";

    // Step 6: can we import jsonwebtoken?
    const jwtMod = await import("jsonwebtoken");
    result.jwtImport = "ok";

    // Step 7: can we import bcryptjs?
    const bcryptMod = await import("bcryptjs");
    result.bcryptImport = "ok";
  } catch (e: any) {
    result.error = e.message;
    result.stack = e.stack?.split("\n").slice(0, 5).join(" | ");
  }

  res.json(result);
}
