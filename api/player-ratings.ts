import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./_db";
import { playerRatings, students, batches } from "../server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  studentId: z.number().int().positive(),
  batchId: z.number().int().positive().optional().nullable(),
  sessionDate: z.string().min(1),
  coachName: z.string().min(1),
  batting: z.number().int().min(1).max(10).optional().nullable(),
  bowling: z.number().int().min(1).max(10).optional().nullable(),
  fielding: z.number().int().min(1).max(10).optional().nullable(),
  fitness: z.number().int().min(1).max(10).optional().nullable(),
  attitude: z.number().int().min(1).max(10).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      const { studentId, batchId, date } = req.query as Record<string, string>;
      const rows = await db
        .select({ rating: playerRatings, student: students, batch: batches })
        .from(playerRatings)
        .leftJoin(students, eq(playerRatings.studentId, students.id))
        .leftJoin(batches, eq(playerRatings.batchId, batches.id))
        .orderBy(playerRatings.sessionDate);

      const filtered = rows.filter(r => {
        if (studentId && r.rating.studentId !== parseInt(studentId)) return false;
        if (batchId && r.rating.batchId !== parseInt(batchId)) return false;
        if (date && r.rating.sessionDate !== date) return false;
        return true;
      });
      return res.json(filtered);
    }

    if (req.method === "POST") {
      const data = schema.parse(req.body);
      const [row] = await db.insert(playerRatings).values(data).returning();
      return res.status(201).json(row);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
}
