import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./_db";
import { sessionNotes, batches } from "../server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  batchId: z.number().int().positive().optional().nullable(),
  sessionDate: z.string().min(1),
  coachName: z.string().min(1),
  drills: z.string().optional().nullable(),
  highlights: z.string().optional().nullable(),
  improvements: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      const rows = await db
        .select({ note: sessionNotes, batch: batches })
        .from(sessionNotes)
        .leftJoin(batches, eq(sessionNotes.batchId, batches.id))
        .orderBy(sessionNotes.sessionDate);
      return res.json(rows);
    }

    if (req.method === "POST") {
      const data = schema.parse(req.body);
      const [row] = await db.insert(sessionNotes).values(data).returning();
      return res.status(201).json(row);
    }

    if (req.method === "PATCH") {
      const { id, ...data } = req.body as any;
      const [row] = await db.update(sessionNotes).set(data).where(eq(sessionNotes.id, id)).returning();
      return res.json(row);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
}
