import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./_db";
import { messageCampaigns, messageTemplates, students, batches, fees } from "../server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  templateId: z.number().int().positive().optional().nullable(),
  audience: z.string().min(1),
  message: z.string().min(1),
  createdBy: z.string().min(1),
});

function resolveVars(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || `{{${key}}}`);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    // GET /api/campaigns?preview=1&audience=all&message=...
    if (req.method === "GET") {
      const { preview, audience, message } = req.query as Record<string, string>;

      if (preview === "1" && audience && message) {
        // Return resolved recipients list for preview
        const allStudents = await db
          .select({ student: students, batch: batches })
          .from(students)
          .leftJoin(batches, eq(students.batchId, batches.id));

        const feeDue = await db.select().from(fees).where(eq(fees.paid, false));
        const feeDueIds = new Set(feeDue.map(f => f.studentId));

        let targets = allStudents;
        if (audience === "active") targets = allStudents.filter(r => r.student.status === "active");
        else if (audience === "trial") targets = allStudents.filter(r => r.student.status === "trial");
        else if (audience === "fee_due") targets = allStudents.filter(r => feeDueIds.has(r.student.id));
        else if (audience.startsWith("batch:")) {
          const bId = parseInt(audience.split(":")[1]);
          targets = allStudents.filter(r => r.student.batchId === bId);
        }

        const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

        const resolved = targets.map(({ student, batch }) => ({
          studentId: student.id,
          name: student.name,
          parentName: student.parentName,
          phone: student.phone,
          batch: batch?.name || "General",
          message: resolveVars(message, {
            childName: student.name,
            parentName: student.parentName,
            phone: student.phone,
            batch: batch?.name || "General",
            date: today,
          }),
          whatsappUrl: `https://wa.me/91${student.phone.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(resolveVars(message, {
            childName: student.name,
            parentName: student.parentName,
            phone: student.phone,
            batch: batch?.name || "General",
            date: today,
          }))}`,
        }));

        return res.json({ recipients: resolved, count: resolved.length });
      }

      // List campaigns
      const all = await db
        .select({ campaign: messageCampaigns, template: messageTemplates })
        .from(messageCampaigns)
        .leftJoin(messageTemplates, eq(messageCampaigns.templateId, messageTemplates.id))
        .orderBy(messageCampaigns.createdAt);
      return res.json(all.reverse());
    }

    if (req.method === "POST") {
      const data = schema.parse(req.body);
      const [row] = await db.insert(messageCampaigns).values({
        ...data,
        templateId: data.templateId || null,
      }).returning();
      return res.status(201).json(row);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
}
