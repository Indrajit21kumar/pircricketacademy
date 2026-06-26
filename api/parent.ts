import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./_db";
import { students, batches, attendance, fees, playerRatings, notifications, sessionNotes } from "../server/db/schema";
import { eq } from "drizzle-orm";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { phone } = req.query as Record<string, string>;
  if (!phone) return res.status(400).json({ error: "Phone number required" });

  try {
    // Find student by parent phone
    const studentRows = await db
      .select({ student: students, batch: batches })
      .from(students)
      .leftJoin(batches, eq(students.batchId, batches.id))
      .where(eq(students.phone, phone.trim()));

    if (studentRows.length === 0) {
      return res.status(404).json({ error: "No student found with this phone number" });
    }

    const studentId = studentRows[0].student.id;

    // Fetch all related data in parallel
    const [attendanceRows, feeRows, ratingRows, notifRows, noteRows] = await Promise.all([
      db.select().from(attendance).where(eq(attendance.studentId, studentId)).orderBy(attendance.sessionDate),
      db.select().from(fees).where(eq(fees.studentId, studentId)).orderBy(fees.month),
      db.select().from(playerRatings).where(eq(playerRatings.studentId, studentId)).orderBy(playerRatings.sessionDate),
      db.select().from(notifications).orderBy(notifications.createdAt),
      db.select({ note: sessionNotes, batch: batches })
        .from(sessionNotes)
        .leftJoin(batches, eq(sessionNotes.batchId, batches.id))
        .where(eq(sessionNotes.batchId, studentRows[0].student.batchId ?? -1))
        .orderBy(sessionNotes.sessionDate),
    ]);

    // Compute stats
    const totalSessions = attendanceRows.length;
    const presentCount = attendanceRows.filter(a => a.status === "present" || a.status === "late").length;
    const attendancePct = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

    const pendingFees = feeRows.filter(f => !f.paid).reduce((s, f) => s + f.amount, 0);
    const paidFees = feeRows.filter(f => f.paid).reduce((s, f) => s + f.amount, 0);

    const latestRating = ratingRows.length > 0 ? ratingRows[ratingRows.length - 1] : null;
    const avgRating = latestRating
      ? (() => {
          const vals = [latestRating.batting, latestRating.bowling, latestRating.fielding, latestRating.fitness, latestRating.attitude].filter(Boolean) as number[];
          return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null;
        })()
      : null;

    return res.json({
      students: studentRows,
      attendance: attendanceRows.slice(-30).reverse(), // last 30 sessions
      fees: feeRows,
      ratings: ratingRows.slice(-10).reverse(),
      notifications: notifRows.slice(-10).reverse(),
      sessionNotes: noteRows.slice(-5).reverse(),
      stats: { totalSessions, presentCount, attendancePct, pendingFees, paidFees, avgRating },
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
