import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./_db";
import { inquiries } from "../server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  childName: z.string().min(1),
  ageGroup: z.string().min(1),
  source: z.string().optional(),
  message: z.string().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      const all = await db.select().from(inquiries).orderBy(inquiries.createdAt);
      return res.json(all);
    }

    if (req.method === "POST") {
      const data = schema.parse(req.body);
      const [row] = await db.insert(inquiries).values({
        ...data,
        email: data.email || null,
        source: data.source || null,
        message: data.message || null,
        status: "new",
      }).returning();
      return res.status(201).json(row);
    }

    if (req.method === "PATCH") {
      const { id, status } = req.body as { id: number; status: string };
      const [row] = await db.update(inquiries).set({ status }).where(eq(inquiries.id, id)).returning();
      return res.json(row);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
}
