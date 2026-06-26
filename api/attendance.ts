import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./_db";
import { attendance, students, batches } from "../server/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const markSchema = z.object({
  qrToken: z.string().min(1),
  markedBy: z.string().min(1),
  sessionDate: z.string().min(1),
  status: z.enum(["present", "late"]).default("present"),
  notes: z.string().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    // GET /api/attendance?date=YYYY-MM-DD or ?studentId=X
    if (req.method === "GET") {
      const { date, studentId, batchId } = req.query as Record<string, string>;
      let query = db
        .select({ attendance, student: students, batch: batches })
        .from(attendance)
        .leftJoin(students, eq(attendance.studentId, students.id))
        .leftJoin(batches, eq(attendance.batchId, batches.id));

      const rows = await query.orderBy(attendance.createdAt);

      const filtered = rows.filter(r => {
        if (date && r.attendance.sessionDate !== date) return false;
        if (studentId && r.attendance.studentId !== parseInt(studentId)) return false;
        if (batchId && r.attendance.batchId !== parseInt(batchId)) return false;
        return true;
      });

      return res.json(filtered);
    }

    // POST — mark attendance via QR scan
    if (req.method === "POST") {
      const data = markSchema.parse(req.body);

      // Find student by QR token
      const [student] = await db.select().from(students).where(eq(students.qrToken, data.qrToken));
      if (!student) return res.status(404).json({ error: "Student not found" });

      // Check if already marked today
      const existing = await db.select().from(attendance).where(
        and(eq(attendance.studentId, student.id), eq(attendance.sessionDate, data.sessionDate))
      );
      if (existing.length > 0) {
        return res.status(409).json({
          error: "Already marked",
          student: { name: student.name, status: existing[0].status },
        });
      }

      const [row] = await db.insert(attendance).values({
        studentId: student.id,
        batchId: student.batchId || null,
        sessionDate: data.sessionDate,
        status: data.status,
        markedBy: data.markedBy,
        notes: data.notes || null,
      }).returning();

      return res.status(201).json({ attendance: row, student });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
}
