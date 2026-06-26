import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./_db";
import { events, batches } from "../server/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1),
  type: z.string().min(1),
  date: z.string().min(1),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  batchId: z.number().int().positive().optional().nullable(),
  venue: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  createdBy: z.string().default("admin"),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      const { month, date } = req.query as Record<string, string>;
      let all = await db
        .select({ event: events, batch: batches })
        .from(events)
        .leftJoin(batches, eq(events.batchId, batches.id))
        .orderBy(events.date, events.startTime);

      if (month) all = all.filter(r => r.event.date.startsWith(month));
      if (date) all = all.filter(r => r.event.date === date);

      return res.json(all);
    }

    if (req.method === "POST") {
      const data = schema.parse(req.body);
      const [row] = await db.insert(events).values({
        ...data,
        batchId: data.batchId ?? null,
        startTime: data.startTime ?? null,
        endTime: data.endTime ?? null,
        venue: data.venue ?? null,
        description: data.description ?? null,
      }).returning();
      return res.status(201).json(row);
    }

    if (req.method === "PATCH") {
      const { id } = req.query as Record<string, string>;
      const data = schema.partial().parse(req.body);
      const [row] = await db.update(events).set(data).where(eq(events.id, parseInt(id))).returning();
      return res.json(row);
    }

    if (req.method === "DELETE") {
      const { id } = req.query as Record<string, string>;
      await db.delete(events).where(eq(events.id, parseInt(id)));
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
}
