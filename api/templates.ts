import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./_db";
import { messageTemplates } from "../server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  content: z.string().min(1),
  createdBy: z.string().min(1),
});

const DEFAULTS = [
  { name: "Welcome New Student", category: "welcome", createdBy: "System",
    content: "🏏 Welcome to PIR Cricket Academy!\n\nDear {{parentName}},\n\nWe're thrilled to welcome {{childName}} to our {{batch}} batch.\n\nPractice Schedule: Please check with your coach for timings.\n\nFor any queries, call us: +91 89360 61688\n\n— PIR Cricket Academy, Patna" },
  { name: "Fee Reminder", category: "fees", createdBy: "System",
    content: "💰 Fee Reminder — PIR Cricket Academy\n\nDear {{parentName}},\n\nThis is a gentle reminder that the monthly fee for {{childName}} is due.\n\nPlease clear the dues at the earliest to continue uninterrupted training.\n\nTo pay, visit the academy or contact:\n📞 +91 89360 61688\n\nThank you!" },
  { name: "Low Attendance Alert", category: "attendance", createdBy: "System",
    content: "⚠️ Attendance Alert — PIR Cricket Academy\n\nDear {{parentName}},\n\n{{childName}}'s attendance has dropped below 75% this month.\n\nRegular practice is essential for improvement and selection. Please ensure {{childName}} attends sessions regularly.\n\nFor support, contact Coach Pankaj: +91 89360 61688" },
  { name: "Trial Confirmation", category: "trial", createdBy: "System",
    content: "🏏 Trial Session Confirmed!\n\nDear {{parentName}},\n\nYour child {{childName}}'s trial session at PIR Cricket Academy is confirmed for {{date}}.\n\n📍 Venue: Sector-A, Police Colony, Anisabad, Patna\n⏰ Please arrive 10 minutes early\n👕 Wear comfortable sports attire\n\nSee you on the pitch! 🏆\n\n— PIR Cricket Academy" },
  { name: "Practice Cancelled", category: "general", createdBy: "System",
    content: "⛔ Session Update — PIR Cricket Academy\n\nDear {{parentName}},\n\nToday's practice session ({{date}}) has been *cancelled* due to unforeseen circumstances.\n\nThe next session will be as per the regular schedule.\n\nApologies for the inconvenience.\n\n— PIR Cricket Academy" },
  { name: "Tournament Notice", category: "general", createdBy: "System",
    content: "🏆 Tournament Announcement!\n\nDear {{parentName}},\n\nPIR Cricket Academy is participating in an upcoming tournament on {{date}}.\n\n{{childName}} has been selected/is eligible to participate!\n\nMore details will follow. Stay tuned.\n\n— PIR Cricket Academy, Patna 🏏" },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      let all = await db.select().from(messageTemplates).orderBy(messageTemplates.category);
      // Seed defaults if empty
      if (all.length === 0) {
        await db.insert(messageTemplates).values(DEFAULTS);
        all = await db.select().from(messageTemplates).orderBy(messageTemplates.category);
      }
      return res.json(all);
    }
    if (req.method === "POST") {
      const data = schema.parse(req.body);
      const [row] = await db.insert(messageTemplates).values(data).returning();
      return res.status(201).json(row);
    }
    if (req.method === "DELETE") {
      const { id } = req.query as Record<string, string>;
      await db.delete(messageTemplates).where(eq(messageTemplates.id, parseInt(id)));
      return res.json({ ok: true });
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
}
