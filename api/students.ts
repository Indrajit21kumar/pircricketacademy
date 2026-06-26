import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./_db";
import { students, batches } from "../server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import crypto from "crypto";

const schema = z.object({
  name: z.string().min(1),
  dob: z.string().min(1),
  ageGroup: z.string().min(1),
  batchId: z.number().int().positive().optional().nullable(),
  parentName: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  address: z.string().optional().nullable(),
  bloodGroup: z.string().optional().nullable(),
  status: z.enum(["active", "inactive", "trial"]).default("active"),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      const rows = await db
        .select({ student: students, batch: batches })
        .from(students)
        .leftJoin(batches, eq(students.batchId, batches.id))
        .orderBy(students.name);
      return res.json(rows);
    }

    if (req.method === "POST") {
      const data = schema.parse(req.body);
      const qrToken = crypto.randomUUID();
      const [row] = await db.insert(students).values({
        ...data,
        email: data.email || null,
        address: data.address || null,
        bloodGroup: data.bloodGroup || null,
        batchId: data.batchId || null,
        qrToken,
      }).returning();
      return res.status(201).json(row);
    }

    if (req.method === "PATCH") {
      const { id, ...data } = req.body as any;
      const [row] = await db.update(students).set(data).where(eq(students.id, id)).returning();
      return res.json(row);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
}
