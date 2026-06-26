import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./_db";
import {
  inquiries, admissions, bookings, users, batches, students,
  attendance, messageTemplates, messageCampaigns, followUps, fees,
  notifications, sessionNotes, playerRatings, events,
} from "../server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "pir-academy-secret-2024";

// ── Auth ───────────────────────────────────────────────────────────────────────
async function handleAuth(req: VercelRequest, res: VercelResponse, sub: string[]) {
  const action = sub[0];
  if (action === "setup" && req.method === "POST") {
    const { password } = req.body;
    if (!password || password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });
    const existing = await db.select().from(users).where(eq(users.username, "admin"));
    if (existing.length > 0) return res.status(409).json({ error: "Admin already exists" });
    const passwordHash = await bcrypt.hash(password, 10);
    await db.insert(users).values({ username: "admin", passwordHash, role: "admin", name: "Indrajit Kumar" });
    return res.status(201).json({ ok: true });
  }
  if (action === "login" && req.method === "POST") {
    const { username, password } = req.body;
    const [user] = await db.select().from(users).where(eq(users.username, username));
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({ token, user: { id: user.id, username: user.username, role: user.role, name: user.name } });
  }
  return res.status(404).json({ error: "Not found" });
}

// ── Inquiries ──────────────────────────────────────────────────────────────────
async function handleInquiries(req: VercelRequest, res: VercelResponse, sub: string[]) {
  const id = sub[0] ? parseInt(sub[0]) : null;
  const action = sub[1];
  if (req.method === "GET") {
    const all = await db.select().from(inquiries).orderBy(inquiries.createdAt);
    return res.json(all.reverse());
  }
  if (req.method === "POST") {
    const data = z.object({
      name: z.string().min(1), phone: z.string().min(1), email: z.string().optional(),
      childName: z.string().min(1), ageGroup: z.string().min(1),
      source: z.string().optional(), message: z.string().optional(),
    }).parse(req.body);
    const [row] = await db.insert(inquiries).values(data).returning();
    return res.status(201).json(row);
  }
  if (req.method === "PATCH" && id && action === "status") {
    const [row] = await db.update(inquiries).set({ status: req.body.status }).where(eq(inquiries.id, id)).returning();
    return res.json(row);
  }
  return res.status(405).json({ error: "Method not allowed" });
}

// ── Follow-ups ─────────────────────────────────────────────────────────────────
async function handleFollowUps(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const { inquiryId } = req.query as Record<string, string>;
    const all = inquiryId
      ? await db.select().from(followUps).where(eq(followUps.inquiryId, parseInt(inquiryId))).orderBy(followUps.createdAt)
      : await db.select().from(followUps).orderBy(followUps.createdAt);
    return res.json(all);
  }
  if (req.method === "POST") {
    const data = z.object({
      inquiryId: z.number().int().positive(), notes: z.string().min(1),
      nextFollowUpDate: z.string().optional().nullable(), createdBy: z.string().min(1),
    }).parse(req.body);
    const [row] = await db.insert(followUps).values(data).returning();
    return res.status(201).json(row);
  }
  return res.status(405).json({ error: "Method not allowed" });
}

// ── Admissions ─────────────────────────────────────────────────────────────────
async function handleAdmissions(req: VercelRequest, res: VercelResponse, sub: string[]) {
  const id = sub[0] ? parseInt(sub[0]) : null;
  const action = sub[1];
  if (req.method === "GET") {
    const all = await db.select().from(admissions).orderBy(admissions.createdAt);
    return res.json(all.reverse());
  }
  if (req.method === "POST") {
    const data = z.object({
      studentName: z.string().min(1), dob: z.string().min(1), ageGroup: z.string().min(1),
      school: z.string().optional(), parentName: z.string().min(1), phone: z.string().min(1),
      email: z.string().optional(), address: z.string().optional(),
      bloodGroup: z.string().optional(), allergies: z.string().optional(),
      asthma: z.boolean().default(false), medicalNotes: z.string().optional(),
      emergencyName: z.string().min(1), emergencyPhone: z.string().min(1),
      isTrial: z.boolean().default(false), trialDate: z.string().optional(),
      message: z.string().optional(), source: z.string().optional(),
    }).parse(req.body);
    const [row] = await db.insert(admissions).values(data).returning();
    return res.status(201).json(row);
  }
  if (req.method === "PATCH" && id && action === "status") {
    const [row] = await db.update(admissions).set({ status: req.body.status }).where(eq(admissions.id, id)).returning();
    return res.json(row);
  }
  return res.status(405).json({ error: "Method not allowed" });
}

// ── Bookings ───────────────────────────────────────────────────────────────────
async function handleBookings(req: VercelRequest, res: VercelResponse, sub: string[]) {
  const id = sub[0] ? parseInt(sub[0]) : null;
  const action = sub[1];
  if (req.method === "GET") {
    const all = await db.select().from(bookings).orderBy(bookings.createdAt);
    return res.json(all.reverse());
  }
  if (req.method === "POST") {
    const data = z.object({
      facility: z.string().min(1), facilityName: z.string().min(1),
      date: z.string().min(1), slot: z.string().min(1),
      duration: z.number().int().positive(), rate: z.number().int().positive(),
      total: z.number().int().positive(), name: z.string().min(1),
      phone: z.string().min(1), email: z.string().optional(),
    }).parse(req.body);
    const ref = "PIR" + Date.now().toString(36).toUpperCase();
    const [row] = await db.insert(bookings).values({ ...data, ref }).returning();
    return res.status(201).json(row);
  }
  if (req.method === "PATCH" && id && action === "status") {
    const [row] = await db.update(bookings).set({ status: req.body.status }).where(eq(bookings.id, id)).returning();
    return res.json(row);
  }
  return res.status(405).json({ error: "Method not allowed" });
}

// ── Batches ────────────────────────────────────────────────────────────────────
async function handleBatches(req: VercelRequest, res: VercelResponse, sub: string[]) {
  const id = sub[0] ? parseInt(sub[0]) : null;
  if (req.method === "GET") {
    return res.json(await db.select().from(batches).orderBy(batches.name));
  }
  if (req.method === "POST") {
    const data = z.object({
      name: z.string().min(1), ageGroup: z.string().min(1),
      schedule: z.string().min(1), coachName: z.string().min(1),
      maxStudents: z.number().int().positive().default(25), isActive: z.boolean().default(true),
    }).parse(req.body);
    const [row] = await db.insert(batches).values(data).returning();
    return res.status(201).json(row);
  }
  if (req.method === "PATCH" && id) {
    const [row] = await db.update(batches).set(req.body).where(eq(batches.id, id)).returning();
    return res.json(row);
  }
  return res.status(405).json({ error: "Method not allowed" });
}

// ── Students ───────────────────────────────────────────────────────────────────
async function handleStudents(req: VercelRequest, res: VercelResponse, sub: string[]) {
  const id = sub[0] ? parseInt(sub[0]) : null;
  if (req.method === "GET") {
    const all = await db.select({ student: students, batch: batches })
      .from(students).leftJoin(batches, eq(students.batchId, batches.id)).orderBy(students.name);
    return res.json(all);
  }
  if (req.method === "POST") {
    const data = z.object({
      name: z.string().min(1), dob: z.string().min(1), ageGroup: z.string().min(1),
      batchId: z.number().int().positive().optional().nullable(),
      parentName: z.string().min(1), phone: z.string().min(1),
      email: z.string().optional(), address: z.string().optional(),
      bloodGroup: z.string().optional(), status: z.string().default("active"),
    }).parse(req.body);
    const qrToken = crypto.randomUUID();
    const [row] = await db.insert(students).values({ ...data, qrToken }).returning();
    return res.status(201).json(row);
  }
  if (req.method === "PATCH" && id) {
    const [row] = await db.update(students).set(req.body).where(eq(students.id, id)).returning();
    return res.json(row);
  }
  return res.status(405).json({ error: "Method not allowed" });
}

// ── Attendance ─────────────────────────────────────────────────────────────────
async function handleAttendance(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const { date } = req.query as Record<string, string>;
    const all = await db.select({ record: attendance, student: students, batch: batches })
      .from(attendance)
      .leftJoin(students, eq(attendance.studentId, students.id))
      .leftJoin(batches, eq(attendance.batchId, batches.id))
      .orderBy(attendance.sessionDate);
    return res.json(date ? all.filter(r => r.record.sessionDate === date) : all);
  }
  if (req.method === "POST") {
    const data = z.object({
      qrToken: z.string().optional(), studentId: z.number().int().positive().optional(),
      batchId: z.number().int().positive().optional().nullable(),
      sessionDate: z.string().min(1), status: z.string().default("present"),
      markedBy: z.string().min(1), notes: z.string().optional().nullable(),
    }).parse(req.body);
    let studentId = data.studentId;
    if (!studentId && data.qrToken) {
      const [s] = await db.select().from(students).where(eq(students.qrToken, data.qrToken));
      if (!s) return res.status(404).json({ error: "Student not found for QR token" });
      studentId = s.id;
    }
    if (!studentId) return res.status(400).json({ error: "studentId or qrToken required" });
    const [row] = await db.insert(attendance).values({
      studentId, batchId: data.batchId ?? null,
      sessionDate: data.sessionDate, status: data.status,
      markedBy: data.markedBy, notes: data.notes ?? null,
    }).returning();
    return res.status(201).json(row);
  }
  return res.status(405).json({ error: "Method not allowed" });
}

// ── Session Notes ──────────────────────────────────────────────────────────────
async function handleSessionNotes(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const { batchId } = req.query as Record<string, string>;
    const all = batchId
      ? await db.select().from(sessionNotes).where(eq(sessionNotes.batchId, parseInt(batchId))).orderBy(sessionNotes.sessionDate)
      : await db.select().from(sessionNotes).orderBy(sessionNotes.sessionDate);
    return res.json(all.reverse());
  }
  if (req.method === "POST") {
    const data = z.object({
      batchId: z.number().int().positive().optional().nullable(),
      sessionDate: z.string().min(1), coachName: z.string().min(1),
      drills: z.string().optional().nullable(), highlights: z.string().optional().nullable(),
      improvements: z.string().optional().nullable(), notes: z.string().optional().nullable(),
    }).parse(req.body);
    const [row] = await db.insert(sessionNotes).values(data).returning();
    return res.status(201).json(row);
  }
  return res.status(405).json({ error: "Method not allowed" });
}

// ── Player Ratings ─────────────────────────────────────────────────────────────
async function handlePlayerRatings(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const { studentId, batchId } = req.query as Record<string, string>;
    let all = await db.select({ rating: playerRatings, student: students })
      .from(playerRatings).leftJoin(students, eq(playerRatings.studentId, students.id)).orderBy(playerRatings.sessionDate);
    if (studentId) all = all.filter(r => r.rating.studentId === parseInt(studentId));
    if (batchId) all = all.filter(r => r.rating.batchId === parseInt(batchId));
    return res.json(all.reverse());
  }
  if (req.method === "POST") {
    const data = z.object({
      studentId: z.number().int().positive(), batchId: z.number().int().positive().optional().nullable(),
      sessionDate: z.string().min(1), coachName: z.string().min(1),
      batting: z.number().int().min(1).max(10).optional().nullable(),
      bowling: z.number().int().min(1).max(10).optional().nullable(),
      fielding: z.number().int().min(1).max(10).optional().nullable(),
      fitness: z.number().int().min(1).max(10).optional().nullable(),
      attitude: z.number().int().min(1).max(10).optional().nullable(),
      notes: z.string().optional().nullable(),
    }).parse(req.body);
    const [row] = await db.insert(playerRatings).values(data).returning();
    return res.status(201).json(row);
  }
  return res.status(405).json({ error: "Method not allowed" });
}

// ── Fees ───────────────────────────────────────────────────────────────────────
async function handleFees(req: VercelRequest, res: VercelResponse, sub: string[]) {
  const id = sub[0] ? parseInt(sub[0]) : null;
  if (req.method === "GET") {
    const { studentId } = req.query as Record<string, string>;
    if (studentId) {
      const all = await db.select().from(fees).where(eq(fees.studentId, parseInt(studentId))).orderBy(fees.month);
      return res.json(all.reverse());
    }
    const all = await db.select({ fee: fees, student: students })
      .from(fees).leftJoin(students, eq(fees.studentId, students.id)).orderBy(fees.month);
    return res.json(all.reverse());
  }
  if (req.method === "POST") {
    const data = z.object({
      studentId: z.number().int().positive(), month: z.string().min(1),
      amount: z.number().int().positive(), paid: z.boolean().default(false),
      paidDate: z.string().optional().nullable(), receiptNo: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
    }).parse(req.body);
    const [row] = await db.insert(fees).values(data).returning();
    return res.status(201).json(row);
  }
  if (req.method === "PATCH" && id) {
    const [row] = await db.update(fees).set(req.body).where(eq(fees.id, id)).returning();
    return res.json(row);
  }
  return res.status(405).json({ error: "Method not allowed" });
}

// ── Notifications ──────────────────────────────────────────────────────────────
async function handleNotifications(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const all = await db.select().from(notifications).orderBy(notifications.createdAt);
    return res.json(all.reverse());
  }
  if (req.method === "POST") {
    const data = z.object({
      title: z.string().min(1), message: z.string().min(1),
      audience: z.string().default("all"), createdBy: z.string().min(1),
    }).parse(req.body);
    const [row] = await db.insert(notifications).values(data).returning();
    return res.status(201).json(row);
  }
  return res.status(405).json({ error: "Method not allowed" });
}

// ── Parent Portal ──────────────────────────────────────────────────────────────
async function handleParent(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const { phone } = req.query as Record<string, string>;
  if (!phone) return res.status(400).json({ error: "phone required" });
  const studentList = await db.select({ student: students, batch: batches })
    .from(students).leftJoin(batches, eq(students.batchId, batches.id)).where(eq(students.phone, phone));
  if (studentList.length === 0) return res.status(404).json({ error: "No students found for this phone number" });
  const studentIds = studentList.map(r => r.student.id);
  const [attRecs, feeRecs, ratingRecs, noticeList] = await Promise.all([
    db.select().from(attendance).orderBy(attendance.sessionDate),
    db.select().from(fees),
    db.select().from(playerRatings).orderBy(playerRatings.sessionDate),
    db.select().from(notifications).orderBy(notifications.createdAt),
  ]);
  return res.json({
    students: studentList,
    attendance: attRecs.filter(r => studentIds.includes(r.studentId)).reverse().slice(0, 30),
    fees: feeRecs.filter(r => studentIds.includes(r.studentId)),
    ratings: ratingRecs.filter(r => studentIds.includes(r.studentId)).reverse().slice(0, 10),
    notices: noticeList.slice(0, 5),
  });
}

// ── Templates ──────────────────────────────────────────────────────────────────
const DEFAULT_TEMPLATES = [
  { name: "Welcome New Student", category: "welcome", createdBy: "System", content: "🏏 Welcome to PIR Cricket Academy!\n\nDear {{parentName}},\n\nWe're thrilled to welcome {{childName}} to our {{batch}} batch.\n\nFor any queries, call us: +91 89360 61688\n\n— PIR Cricket Academy, Patna" },
  { name: "Fee Reminder", category: "fees", createdBy: "System", content: "💰 Fee Reminder — PIR Cricket Academy\n\nDear {{parentName}},\n\nThe monthly fee for {{childName}} is due. Please clear at the earliest.\n\n📞 +91 89360 61688" },
  { name: "Low Attendance Alert", category: "attendance", createdBy: "System", content: "⚠️ Attendance Alert — PIR Cricket Academy\n\nDear {{parentName}},\n\n{{childName}}'s attendance has dropped below 75%. Please ensure regular attendance.\n\nContact Coach Pankaj: +91 89360 61688" },
  { name: "Trial Confirmation", category: "trial", createdBy: "System", content: "🏏 Trial Session Confirmed!\n\nDear {{parentName}},\n\n{{childName}}'s trial at PIR Cricket Academy is confirmed for {{date}}.\n\n📍 Sector-A, Police Colony, Anisabad, Patna\n⏰ Arrive 10 min early\n\n— PIR Cricket Academy" },
  { name: "Practice Cancelled", category: "general", createdBy: "System", content: "⛔ Session Update — PIR Cricket Academy\n\nDear {{parentName}},\n\nToday's practice ({{date}}) has been *cancelled*. Next session as per regular schedule.\n\n— PIR Cricket Academy" },
  { name: "Tournament Notice", category: "general", createdBy: "System", content: "🏆 Tournament Announcement!\n\nDear {{parentName}},\n\nPIR Cricket Academy is participating in a tournament on {{date}}. {{childName}} is eligible!\n\nMore details soon.\n\n— PIR Cricket Academy 🏏" },
];

async function handleTemplates(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    let all = await db.select().from(messageTemplates).orderBy(messageTemplates.category);
    if (all.length === 0) {
      await db.insert(messageTemplates).values(DEFAULT_TEMPLATES);
      all = await db.select().from(messageTemplates).orderBy(messageTemplates.category);
    }
    return res.json(all);
  }
  if (req.method === "POST") {
    const data = z.object({
      name: z.string().min(1), category: z.string().min(1),
      content: z.string().min(1), createdBy: z.string().min(1),
    }).parse(req.body);
    const [row] = await db.insert(messageTemplates).values(data).returning();
    return res.status(201).json(row);
  }
  if (req.method === "DELETE") {
    const { id } = req.query as Record<string, string>;
    await db.delete(messageTemplates).where(eq(messageTemplates.id, parseInt(id)));
    return res.json({ ok: true });
  }
  return res.status(405).json({ error: "Method not allowed" });
}

// ── Campaigns ──────────────────────────────────────────────────────────────────
function resolveVars(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || `{{${key}}}`);
}

async function handleCampaigns(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const { preview, audience, message } = req.query as Record<string, string>;
    if (preview === "1" && audience && message) {
      const allStudents = await db.select({ student: students, batch: batches })
        .from(students).leftJoin(batches, eq(students.batchId, batches.id));
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
      const resolved = targets.map(({ student, batch }) => {
        const vars = { childName: student.name, parentName: student.parentName, phone: student.phone, batch: batch?.name || "General", date: today };
        return {
          studentId: student.id, name: student.name, parentName: student.parentName,
          phone: student.phone, batch: batch?.name || "General",
          message: resolveVars(message, vars),
          whatsappUrl: `https://wa.me/91${student.phone.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(resolveVars(message, vars))}`,
        };
      });
      return res.json({ recipients: resolved, count: resolved.length });
    }
    const all = await db.select({ campaign: messageCampaigns, template: messageTemplates })
      .from(messageCampaigns).leftJoin(messageTemplates, eq(messageCampaigns.templateId, messageTemplates.id)).orderBy(messageCampaigns.createdAt);
    return res.json(all.reverse());
  }
  if (req.method === "POST") {
    const data = z.object({
      name: z.string().min(1), templateId: z.number().int().positive().optional().nullable(),
      audience: z.string().min(1), message: z.string().min(1), createdBy: z.string().min(1),
    }).parse(req.body);
    const [row] = await db.insert(messageCampaigns).values({ ...data, templateId: data.templateId || null }).returning();
    return res.status(201).json(row);
  }
  return res.status(405).json({ error: "Method not allowed" });
}

// ── Events ─────────────────────────────────────────────────────────────────────
async function handleEvents(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const { month, date } = req.query as Record<string, string>;
    let all = await db.select({ event: events, batch: batches })
      .from(events).leftJoin(batches, eq(events.batchId, batches.id)).orderBy(events.date);
    if (month) all = all.filter(r => r.event.date.startsWith(month));
    if (date) all = all.filter(r => r.event.date === date);
    return res.json(all);
  }
  if (req.method === "POST") {
    const data = z.object({
      title: z.string().min(1), type: z.string().min(1), date: z.string().min(1),
      startTime: z.string().optional().nullable(), endTime: z.string().optional().nullable(),
      batchId: z.number().int().positive().optional().nullable(),
      venue: z.string().optional().nullable(), description: z.string().optional().nullable(),
      createdBy: z.string().default("admin"),
    }).parse(req.body);
    const [row] = await db.insert(events).values({
      ...data, batchId: data.batchId ?? null, startTime: data.startTime ?? null,
      endTime: data.endTime ?? null, venue: data.venue ?? null, description: data.description ?? null,
    }).returning();
    return res.status(201).json(row);
  }
  if (req.method === "PATCH") {
    const { id } = req.query as Record<string, string>;
    const [row] = await db.update(events).set(req.body).where(eq(events.id, parseInt(id))).returning();
    return res.json(row);
  }
  if (req.method === "DELETE") {
    const { id } = req.query as Record<string, string>;
    await db.delete(events).where(eq(events.id, parseInt(id)));
    return res.json({ ok: true });
  }
  return res.status(405).json({ error: "Method not allowed" });
}

// ── Main Router ────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  // Parse resource from URL directly — more reliable than req.query.path
  const rawPath = (req.url || "").split("?")[0]; // e.g. /api/bookings or /api/auth/login
  const segments = rawPath.replace(/^\/api\/?/, "").split("/").filter(Boolean);
  const [resource, ...sub] = segments;

  try {
    switch (resource) {
      case "auth":           return handleAuth(req, res, sub);
      case "inquiries":      return handleInquiries(req, res, sub);
      case "follow-ups":     return handleFollowUps(req, res);
      case "admissions":     return handleAdmissions(req, res, sub);
      case "bookings":       return handleBookings(req, res, sub);
      case "batches":        return handleBatches(req, res, sub);
      case "students":       return handleStudents(req, res, sub);
      case "attendance":     return handleAttendance(req, res);
      case "session-notes":  return handleSessionNotes(req, res);
      case "player-ratings": return handlePlayerRatings(req, res);
      case "fees":           return handleFees(req, res, sub);
      case "notifications":  return handleNotifications(req, res);
      case "parent":         return handleParent(req, res);
      case "templates":      return handleTemplates(req, res);
      case "campaigns":      return handleCampaigns(req, res);
      case "events":         return handleEvents(req, res);
      default:               return res.status(404).json({ error: `Unknown resource: ${resource}` });
    }
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
}
