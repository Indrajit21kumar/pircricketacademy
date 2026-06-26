import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./_db";
import { followUps, inquiries } from "../server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  inquiryId: z.number().int().positive(),
  notes: z.string().min(1),
  nextFollowUpDate: z.string().optional().nullable(),
  createdBy: z.string().min(1),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      const { inquiryId } = req.query as Record<string, string>;
      const rows = await db
        .select({ followUp: followUps, inquiry: inquiries })
        .from(followUps)
        .leftJoin(inquiries, eq(followUps.inquiryId, inquiries.id))
        .orderBy(followUps.createdAt);
      const filtered = inquiryId
        ? rows.filter(r => r.followUp.inquiryId === parseInt(inquiryId))
        : rows;
      return res.json(filtered.reverse());
    }
    if (req.method === "POST") {
      const data = schema.parse(req.body);
      const [row] = await db.insert(followUps).values({
        ...data,
        nextFollowUpDate: data.nextFollowUpDate || null,
      }).returning();
      return res.status(201).json(row);
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
}
