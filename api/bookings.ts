import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./_db";
import { bookings } from "../server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  facility: z.string().min(1),
  facilityName: z.string().min(1),
  date: z.string().min(1),
  slot: z.string().min(1),
  duration: z.number().int().positive(),
  rate: z.number().int().positive(),
  total: z.number().int().positive(),
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
});

function makeRef() {
  return "PIR" + Date.now().toString(36).toUpperCase();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      const all = await db.select().from(bookings).orderBy(bookings.createdAt);
      return res.json(all);
    }

    if (req.method === "POST") {
      const data = schema.parse(req.body);
      const [row] = await db.insert(bookings).values({
        ...data,
        ref: makeRef(),
        email: data.email || null,
        status: "confirmed",
      }).returning();
      return res.status(201).json(row);
    }

    if (req.method === "PATCH") {
      const { id, status } = req.body as { id: number; status: string };
      const [row] = await db.update(bookings).set({ status }).where(eq(bookings.id, id)).returning();
      return res.json(row);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
}
