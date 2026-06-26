import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./_db";
import { batches } from "../server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  ageGroup: z.string().min(1),
  schedule: z.string().min(1),
  coachName: z.string().min(1),
  maxStudents: z.number().int().positive().default(25),
  isActive: z.boolean().default(true),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      const all = await db.select().from(batches).orderBy(batches.name);
      return res.json(all);
    }
    if (req.method === "POST") {
      const data = schema.parse(req.body);
      const [row] = await db.insert(batches).values(data).returning();
      return res.status(201).json(row);
    }
    if (req.method === "PATCH") {
      const { id, ...data } = req.body as any;
      const [row] = await db.update(batches).set(data).where(eq(batches.id, id)).returning();
      return res.json(row);
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
}
