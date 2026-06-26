import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./_db";
import { fees, students } from "../server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  studentId: z.number().int().positive(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  amount: z.number().int().positive(),
  paid: z.boolean().default(false),
  paidDate: z.string().optional().nullable(),
  receiptNo: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      const { studentId } = req.query as Record<string, string>;
      const rows = await db
        .select({ fee: fees, student: students })
        .from(fees)
        .leftJoin(students, eq(fees.studentId, students.id))
        .orderBy(fees.month);
      const filtered = studentId
        ? rows.filter(r => r.fee.studentId === parseInt(studentId))
        : rows;
      return res.json(filtered);
    }

    if (req.method === "POST") {
      const data = schema.parse(req.body);
      const [row] = await db.insert(fees).values({
        ...data,
        paidDate: data.paidDate || null,
        receiptNo: data.receiptNo || null,
        notes: data.notes || null,
      }).returning();
      return res.status(201).json(row);
    }

    if (req.method === "PATCH") {
      const { id, ...data } = req.body as any;
      const [row] = await db.update(fees).set(data).where(eq(fees.id, id)).returning();
      return res.json(row);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
}
