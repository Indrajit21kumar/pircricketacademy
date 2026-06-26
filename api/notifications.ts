import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./_db";
import { notifications } from "../server/db/schema";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  audience: z.string().default("all"),
  createdBy: z.string().min(1),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      const all = await db.select().from(notifications).orderBy(notifications.createdAt);
      return res.json(all.reverse());
    }
    if (req.method === "POST") {
      const data = schema.parse(req.body);
      const [row] = await db.insert(notifications).values(data).returning();
      return res.status(201).json(row);
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
}
