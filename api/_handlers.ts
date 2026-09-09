import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./_db.js";
import {
  inquiries, admissions, bookings, users, batches, students,
  attendance, messageTemplates, messageCampaigns, followUps, fees,
  notifications, sessionNotes, playerRatings, events,
  discountTypes, discountApplications, passwordResets, blockedSlots, feePackages,
  facilityRates, feeConfig,
} from "../server/db/schema.js";
import { eq, inArray, lt, and } from "drizzle-orm";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET environment variable is not set");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "kumarindrajitcricket@gmail.com";

// Simple in-memory brute-force guard (resets on cold start, good enough for serverless)
const loginAttempts: Record<string, { count: number; lockedUntil: number }> = {};
function checkBruteForce(ip: string): void {
  const now = Date.now();
  const entry = loginAttempts[ip] || { count: 0, lockedUntil: 0 };
  if (entry.lockedUntil > now) throw Object.assign(new Error("Too many failed attempts. Try again in 15 minutes."), { status: 429 });
  loginAttempts[ip] = entry;
}
function recordFailedLogin(ip: string): void {
  const entry = loginAttempts[ip] || { count: 0, lockedUntil: 0 };
  entry.count += 1;
  if (entry.count >= 5) entry.lockedUntil = Date.now() + 15 * 60 * 1000;
  loginAttempts[ip] = entry;
}
function clearLoginAttempts(ip: string): void {
  delete loginAttempts[ip];
}

// ── Auth helpers ───────────────────────────────────────────────────────────────
function authenticate(req: VercelRequest): any {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) throw Object.assign(new Error("Unauthorized"), { status: 401 });
  try { return jwt.verify(auth.slice(7), JWT_SECRET!); }
  catch { throw Object.assign(new Error("Invalid or expired token"), { status: 401 }); }
}
function requireAdmin(req: VercelRequest): any {
  const claims = authenticate(req);
  if (claims.role !== "admin") throw Object.assign(new Error("Admin only"), { status: 403 });
  return claims;
}
function requireStaff(req: VercelRequest): any {
  const claims = authenticate(req);
  if (claims.role !== "admin" && claims.role !== "coach" && claims.role !== "receptionist") throw Object.assign(new Error("Staff only"), { status: 403 });
  return claims;
}
function requireAdminOrReception(req: VercelRequest): any {
  const claims = authenticate(req);
  if (claims.role !== "admin" && claims.role !== "receptionist") throw Object.assign(new Error("Not authorized"), { status: 403 });
  return claims;
}

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
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || "unknown";
    try { checkBruteForce(ip); } catch (e: any) { return res.status(429).json({ error: e.message }); }
    const { username, password } = req.body;
    const [user] = await db.select().from(users).where(eq(users.username, username));
    if (!user) { recordFailedLogin(ip); return res.status(401).json({ error: "Invalid credentials" }); }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) { recordFailedLogin(ip); return res.status(401).json({ error: "Invalid credentials" }); }
    clearLoginAttempts(ip);
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET!, { expiresIn: "7d" });
    return res.json({ token, user: { id: user.id, username: user.username, role: user.role, name: user.name } });
  }
  return res.status(404).json({ error: "Not found" });
}

// ── Inquiries ──────────────────────────────────────────────────────────────────
async function handleInquiries(req: VercelRequest, res: VercelResponse, sub: string[]) {
  const id = sub[0] ? parseInt(sub[0]) : null;
  const action = sub[1];
  if (req.method === "GET") {
    try { requireAdmin(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
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
    // Notify admin of new inquiry — must await before returning
    await sendEmail(ADMIN_EMAIL, `New Inquiry: ${data.childName} (${data.ageGroup}) — PIR Cricket Academy`,
      `<div style="font-family:sans-serif;max-width:500px">
        <h2 style="color:#eab308">🏏 New Inquiry — PIR Cricket Academy</h2>
        <table style="width:100%;border-collapse:collapse">
          ${[["Parent",data.name],["Phone",data.phone],["Email",data.email||"—"],["Child",data.childName],["Age Group",data.ageGroup],["Source",data.source||"—"],["Message",data.message||"—"],["Inquiry ID","INQ-"+row.id]].map(([k,v])=>`<tr><td style="padding:6px 12px 6px 0;color:#666;font-size:14px">${k}</td><td style="padding:6px 0;font-weight:bold;font-size:14px">${v}</td></tr>`).join("")}
        </table>
      </div>`
    ).catch(() => {});
    return res.status(201).json(row);
  }
  if (req.method === "PATCH" && id && action === "status") {
    try { requireAdmin(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
    const { status } = z.object({ status: z.enum(["new","contacted","trial_scheduled","converted","rejected","not_interested"]) }).parse(req.body);
    const [row] = await db.update(inquiries).set({ status }).where(eq(inquiries.id, id)).returning();
    return res.json(row);
  }
  if (req.method === "DELETE" && id) {
    try { requireAdmin(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
    const deleted = await db.delete(inquiries).where(eq(inquiries.id, id)).returning();
    if (!deleted.length) return res.status(404).json({ error: "Inquiry not found" });
    return res.json({ ok: true });
  }
  return res.status(405).json({ error: "Method not allowed" });
}

// ── Follow-ups ─────────────────────────────────────────────────────────────────
async function handleFollowUps(req: VercelRequest, res: VercelResponse) {
  try { requireAdmin(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
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
async function sendAdmissionNotifications(data: {
  studentName: string; ageGroup: string; parentName: string; phone: string; email?: string;
  isTrial: boolean; trialDate?: string; school?: string; asthma: boolean;
  emergencyName: string; emergencyPhone: string; dob: string; address?: string;
  razorpayPaymentId?: string; admissionId: number;
  totalPaid?: number; packageMonths?: number | null; combinedDiscountPct?: number | null;
}) {
  const adminEmail = ADMIN_EMAIL;
  const adminPhone = process.env.ADMIN_PHONE || "7903053204";
  const type = data.isTrial ? "Free Trial Session" : "Admission Application";

  const amountPaid = data.totalPaid ?? 5000;
  const amountStr = `₹${amountPaid.toLocaleString("en-IN")}`;
  const packageLabel = data.packageMonths ? `${data.packageMonths}-Month Pack` : "Registration Only";
  const discountLabel = (data.combinedDiscountPct ?? 0) > 0 ? ` (${data.combinedDiscountPct}% discount applied)` : "";

  const customerHtml = `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#0a0f1e;color:#fff;border-radius:12px;overflow:hidden">
      <div style="background:#eab308;padding:24px;text-align:center">
        <img src="https://pircricketacademy.co.in/images/pir-logo-400.png" alt="PIR Cricket Academy" style="height:64px;width:auto;margin-bottom:10px;display:block;margin-left:auto;margin-right:auto" />
        <h1 style="margin:0;color:#000;font-size:22px">PIR Cricket Academy</h1>
        <p style="margin:4px 0 0;color:#000;font-size:14px">Registration Confirmed ✅</p>
      </div>
      <div style="padding:28px">
        <p style="color:#94a3b8;margin:0 0 20px">Dear <strong style="color:#fff">${data.parentName}</strong>, we have received ${data.studentName}'s ${type} and your payment of <strong style="color:#eab308">${amountStr}</strong> is confirmed.</p>
        <table style="width:100%;border-collapse:collapse">
          ${[
            ["Student", data.studentName],
            ["Age Group", data.ageGroup],
            ["Package", packageLabel + discountLabel],
            ["Type", type],
            ...(data.trialDate ? [["Trial Date", data.trialDate]] : []),
            ["Amount Paid", amountStr + " ✓"],
            ["Payment Ref", data.razorpayPaymentId || "—"],
            ["Status", "Under Review"],
          ].map(([k,v])=>`<tr><td style="padding:8px 0;color:#94a3b8;border-bottom:1px solid #1e293b;font-size:14px">${k}</td><td style="padding:8px 0;color:#fff;border-bottom:1px solid #1e293b;font-size:14px;font-weight:bold;text-align:right">${v}</td></tr>`).join("")}
        </table>
        <p style="color:#94a3b8;margin:24px 0 0;font-size:13px">We will contact you on <strong style="color:#fff">${data.phone}</strong> within 24 hours. For queries, WhatsApp us at +91 ${adminPhone}</p>
      </div>
    </div>`;

  const adminHtml = `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
      <h2 style="color:#eab308">🏏 New ${type} (Payment Confirmed) — PIR Cricket Academy</h2>
      <table style="width:100%;border-collapse:collapse">
        ${[
          ["Student", data.studentName], ["DOB", data.dob], ["Age Group", data.ageGroup],
          ["School", data.school||"—"], ["Parent", data.parentName], ["Phone", data.phone],
          ["Email", data.email||"—"], ["Address", data.address||"—"],
          ["Trial", data.isTrial ? "Yes — "+(data.trialDate||"date TBD") : "No"],
          ["Asthma", data.asthma ? "Yes" : "No"],
          ["Emergency", data.emergencyName+" / "+data.emergencyPhone],
          ["Package", packageLabel], ["Discount", discountLabel || "None"],
          ["Amount Paid", amountStr],
          ["Payment Ref", data.razorpayPaymentId||"—"],
          ["Admission ID", "ADM-"+data.admissionId],
        ].map(([k,v])=>`<tr><td style="padding:6px 12px 6px 0;color:#666;font-size:14px">${k}</td><td style="padding:6px 0;font-weight:bold;font-size:14px">${v}</td></tr>`).join("")}
      </table>
    </div>`;

  const adminWA = `🏏 *New ${type}!* (${amountStr} Paid)\n\n👤 *Student:* ${data.studentName} (${data.ageGroup})\n👨 *Parent:* ${data.parentName}\n📞 *Phone:* ${data.phone}\n📧 *Email:* ${data.email||"—"}\n${data.isTrial ? `📅 *Trial Date:* ${data.trialDate||"TBD"}\n` : ""}🏫 *School:* ${data.school||"—"}\n📦 *Package:* ${packageLabel}${discountLabel}\n⚠️ *Asthma:* ${data.asthma?"Yes":"No"}\n💳 *Payment Ref:* ${data.razorpayPaymentId||"—"}\n🔖 *Ref:* ADM-${data.admissionId}`;
  const customerWA = `✅ *Registration Confirmed!*\n\nDear ${data.parentName}, we have received ${data.studentName}'s ${type} at PIR Cricket Academy.\n\n💰 *Amount Paid:* ${amountStr}${discountLabel}\n📦 *Package:* ${packageLabel}\n\nWe will contact you on ${data.phone} within 24 hours.\n\n🏏 PIR Cricket Academy — Patna`;

  await Promise.allSettled([
    data.email ? sendEmail(data.email, `Registration Confirmed — PIR Cricket Academy`, customerHtml) : Promise.resolve(),
    sendEmail(adminEmail, `New ${type}: ${data.studentName} — PIR Cricket Academy`, adminHtml),
    data.phone ? sendWhatsApp(data.phone, customerWA) : Promise.resolve(),
    sendWhatsApp(adminPhone, adminWA),
  ]);
}

async function handleAdmissions(req: VercelRequest, res: VercelResponse, sub: string[]) {
  const first = sub[0];
  const id = first && first !== "verify" && first !== "offline" ? parseInt(first) : null;
  const action = id ? sub[1] : first;

  if (req.method === "GET") {
    try { requireAdminOrReception(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
    const all = await db.select().from(admissions).orderBy(admissions.createdAt);
    return res.json(all.reverse());
  }

  // POST /admissions/verify — verify Razorpay payment, update DB, send notifications
  if (req.method === "POST" && action === "verify") {
    const { admissionId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    const expected = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");
    if (expected !== razorpaySignature) {
      return res.status(400).json({ error: "Payment verification failed — signature mismatch" });
    }
    const [row] = await db
      .update(admissions)
      .set({ paymentStatus: "paid", razorpayPaymentId, paidAt: new Date() })
      .where(eq(admissions.id, parseInt(admissionId)))
      .returning();
    if (!row) return res.status(404).json({ error: "Admission not found" });

    await sendAdmissionNotifications({
      studentName: row.studentName, ageGroup: row.ageGroup, parentName: row.parentName,
      phone: row.phone, email: row.email ?? undefined, isTrial: row.isTrial,
      trialDate: row.trialDate ?? undefined, school: row.school ?? undefined,
      asthma: row.asthma, emergencyName: row.emergencyName, emergencyPhone: row.emergencyPhone,
      dob: row.dob, address: row.address ?? undefined,
      razorpayPaymentId: razorpayPaymentId, admissionId: row.id,
      totalPaid: row.totalPaid, packageMonths: row.packageMonths, combinedDiscountPct: row.combinedDiscountPct,
    }).catch(() => {});

    return res.json({ ok: true, ref: `ADM-${row.id}` });
  }

  // POST /admissions/offline — admin scans paper form, no payment required
  if (req.method === "POST" && action === "offline") {
    try { requireAdminOrReception(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
    const data = z.object({
      studentName: z.string().min(1), dob: z.string().min(1), ageGroup: z.string().min(1),
      school: z.string().optional(), dressSize: z.string().optional(),
      parentName: z.string().min(1), phone: z.string().min(1),
      email: z.string().email().optional(),
      address: z.string().optional(), bloodGroup: z.string().optional(),
      allergies: z.string().optional(), asthma: z.boolean().default(false),
      medicalNotes: z.string().optional(),
      emergencyName: z.string().min(1), emergencyPhone: z.string().min(1),
      consentMedical: z.boolean().default(true), consentPhoto: z.boolean().default(true),
      consentLiability: z.boolean().default(true), consentTerms: z.boolean().default(true),
      consentData: z.boolean().default(true),
      isTrial: z.boolean().default(false), source: z.string().optional(),
    }).parse(req.body);
    const ip = (req.headers["x-forwarded-for"] as string || "").split(",")[0].trim() || "admin";
    await seedFeeConfig();
    const feeRowsOffline = await db.select().from(feeConfig);
    const regFeeOffline = feeRowsOffline.find(r => r.key === "registration_fee")?.value ?? 5000;
    const [row] = await db.insert(admissions).values({
      ...data,
      consentIp: ip,
      paymentStatus: "pending",
      registrationFee: regFeeOffline,
      totalPaid: regFeeOffline,
      packageMonths: null,
      packageDiscountPct: 0,
      eligibilityDiscountPct: 0,
      combinedDiscountPct: 0,
    }).returning();
    const adminPhone = process.env.ADMIN_PHONE || "7903053204";
    await Promise.allSettled([
      sendEmail(ADMIN_EMAIL, `Offline Form Scanned: ${data.studentName} (${data.ageGroup}) — PIR Cricket Academy`,
        `<div style="font-family:sans-serif;max-width:500px"><h2 style="color:#eab308">🏏 Offline Paper Form Registered — PIR Cricket Academy</h2><table style="width:100%;border-collapse:collapse">${[["Student",data.studentName],["DOB",data.dob],["Age Group",data.ageGroup],["School",data.school||"—"],["Parent",data.parentName],["Phone",data.phone],["Email",data.email||"—"],["Address",data.address||"—"],["Asthma",data.asthma?"Yes":"No"],["Emergency",data.emergencyName+" / "+data.emergencyPhone],["Admission ID","ADM-"+row.id],["Payment","Pending (collect at academy)"]].map(([k,v])=>`<tr><td style="padding:6px 12px 6px 0;color:#666;font-size:14px">${k}</td><td style="padding:6px 0;font-weight:bold;font-size:14px">${v}</td></tr>`).join("")}</table></div>`
      ),
      sendWhatsApp(adminPhone, `🏏 *Offline Form Scanned!*\n\n👤 *Student:* ${data.studentName} (${data.ageGroup})\n👨 *Parent:* ${data.parentName}\n📞 *Phone:* ${data.phone}\n🔖 *Ref:* ADM-${row.id}\n\n⏳ Registration fee pending — collect at academy.`),
    ]);
    return res.status(201).json({ id: row.id, ref: `ADM-${row.id}` });
  }

  // POST /admissions — create admission record + Razorpay order
  if (req.method === "POST") {
    const data = z.object({
      studentName: z.string().min(1), dob: z.string().min(1), ageGroup: z.string().min(1),
      school: z.string().optional(), dressSize: z.string().optional(),
      parentName: z.string().min(1), phone: z.string().min(1),
      email: z.string().email(), address: z.string().optional(),
      bloodGroup: z.string().optional(), allergies: z.string().optional(),
      asthma: z.boolean().default(false), medicalNotes: z.string().optional(),
      emergencyName: z.string().min(1), emergencyPhone: z.string().min(1),
      consentMedical: z.boolean().default(false), consentPhoto: z.boolean().default(false),
      consentLiability: z.boolean().default(false), consentTerms: z.boolean().default(false),
      consentData: z.boolean().default(false),
      isTrial: z.boolean().default(false), trialDate: z.string().optional(),
      message: z.string().optional(), source: z.string().optional(),
      packageMonths: z.number().int().nullable().optional(),
      eligibilityDiscountPct: z.number().int().min(0).max(100).optional(),
    }).parse(req.body);

    // Calculate amounts — read from DB fee config (falls back to defaults if not seeded)
    await seedFeeConfig();
    const feeRows = await db.select().from(feeConfig);
    const getFee = (key: string, fallback: number) => feeRows.find(r => r.key === key)?.value ?? fallback;
    const MONTHLY_FEE = getFee("monthly_fee", 3500);
    const KIT_FEE = getFee("kit_fee", 2000);
    const REG_FEE = getFee("registration_fee", 5000);
    const pkgMonths = data.packageMonths ?? null;
    const pkgRow = pkgMonths ? (await db.select().from(feePackages).where(eq(feePackages.months, pkgMonths)))[0] : null;
    const pkgDiscount = pkgRow?.discountPct ?? (pkgMonths === 3 ? 10 : pkgMonths === 6 ? 15 : pkgMonths === 12 ? 20 : 0);
    const eligPct = data.eligibilityDiscountPct ?? 0;
    const combinedPct = Math.min(pkgDiscount + eligPct, 90);
    const monthlyTotal = pkgMonths ? Math.round(pkgMonths * MONTHLY_FEE * (1 - combinedPct / 100)) : 0;
    const kitFee = pkgMonths ? KIT_FEE : 0;
    const totalPaid = REG_FEE + kitFee + monthlyTotal;

    const ip = (req.headers["x-forwarded-for"] as string || "").split(",")[0].trim() || "unknown";
    const [row] = await db.insert(admissions).values({
      ...data,
      consentIp: ip,
      paymentStatus: "pending",
      registrationFee: REG_FEE,
      packageMonths: pkgMonths,
      packageDiscountPct: pkgDiscount,
      eligibilityDiscountPct: eligPct,
      combinedDiscountPct: combinedPct,
      totalPaid,
    }).returning();

    // Create Razorpay order
    const keyId = process.env.RAZORPAY_KEY_ID || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    if (!keyId || !keySecret) return res.status(500).json({ error: "Razorpay keys not configured" });

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: totalPaid * 100, currency: "INR", receipt: `ADM-${row.id}` }),
    });
    if (!orderRes.ok) {
      const err = await orderRes.text();
      return res.status(500).json({ error: "Failed to create payment order", detail: err });
    }
    const order = await (orderRes.json() as Promise<{ id: string }>);
    await db.update(admissions).set({ razorpayOrderId: order.id }).where(eq(admissions.id, row.id));

    // Notify admin of new admission form submission (payment still pending)
    const adminPhone = process.env.ADMIN_PHONE || "7903053204";
    const admissionWA = `🏏 *New Admission Form Submitted!* (Payment Pending)\n\n👤 *Student:* ${data.studentName} (${data.ageGroup})\n👨 *Parent:* ${data.parentName}\n📞 *Phone:* ${data.phone}\n📧 *Email:* ${data.email||"—"}\n${data.isTrial ? `📅 *Trial:* Yes — ${data.trialDate||"date TBD"}\n` : ""}🏫 *School:* ${data.school||"—"}\n⚠️ *Asthma:* ${data.asthma?"Yes":"No"}\n💰 *Total Fee:* ₹${totalPaid}\n🔖 *Ref:* ADM-${row.id}\n\n⏳ Payment not yet completed.`;
    await Promise.allSettled([
      sendEmail(ADMIN_EMAIL, `New Admission Form: ${data.studentName} (${data.ageGroup}) — PIR Cricket Academy`,
        `<div style="font-family:sans-serif;max-width:500px">
          <h2 style="color:#eab308">🏏 New Admission Submitted (Payment Pending) — PIR Cricket Academy</h2>
          <table style="width:100%;border-collapse:collapse">
            ${[["Student",data.studentName],["DOB",data.dob],["Age Group",data.ageGroup],["School",data.school||"—"],["Parent",data.parentName],["Phone",data.phone],["Email",data.email||"—"],["Address",data.address||"—"],["Trial",data.isTrial?"Yes — "+(data.trialDate||"date TBD"):"No"],["Asthma",data.asthma?"Yes":"No"],["Emergency",data.emergencyName+" / "+data.emergencyPhone],["Total Fee","₹"+totalPaid],["Admission ID","ADM-"+row.id]].map(([k,v])=>`<tr><td style="padding:6px 12px 6px 0;color:#666;font-size:14px">${k}</td><td style="padding:6px 0;font-weight:bold;font-size:14px">${v}</td></tr>`).join("")}
          </table>
          <p style="color:#888;font-size:13px;margin-top:16px">⏳ Payment not yet completed. You will receive another email once payment is confirmed.</p>
        </div>`
      ),
      sendWhatsApp(adminPhone, admissionWA),
    ]);

    return res.status(201).json({
      id: row.id, orderId: order.id, keyId, amount: totalPaid * 100, totalPaid,
      studentName: data.studentName, parentName: data.parentName,
      phone: data.phone, email: data.email,
    });
  }

  if (req.method === "PATCH" && id && action === "status") {
    try { requireAdmin(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
    const body = z.object({
      status: z.enum(["new","trial_scheduled","joined","rejected","withdrawn"]),
      trialDate: z.string().optional(),
      trialSlot: z.string().optional(),
    }).parse(req.body);
    const updateData: Record<string,any> = { status: body.status };
    if (body.trialDate) updateData.trialDate = body.trialDate;
    const [row] = await db.update(admissions).set(updateData).where(eq(admissions.id, id)).returning();
    const adminPhone = process.env.ADMIN_PHONE || "7903053204";
    const statusLabels: Record<string,string> = { new:"New", trial_scheduled:"Trial Scheduled", joined:"Joined ✅", rejected:"Rejected ❌", withdrawn:"Withdrawn" };

    // Build customer notification based on new status
    const notifications: Promise<any>[] = [
      sendEmail(ADMIN_EMAIL, `Admission Status Updated: ${row.studentName} → ${statusLabels[body.status]||body.status} — PIR Cricket Academy`,
        `<div style="font-family:sans-serif;max-width:500px">
          <h2 style="color:#eab308">🏏 Admission Status Changed — PIR Cricket Academy</h2>
          <table style="width:100%;border-collapse:collapse">
            ${[["Student",row.studentName],["Age Group",row.ageGroup],["Parent",row.parentName],["Phone",row.phone],["New Status",statusLabels[body.status]||body.status],["Trial Date",body.trialDate||row.trialDate||"—"],["Trial Slot",body.trialSlot||"—"],["Admission ID","ADM-"+row.id]].map(([k,v])=>`<tr><td style="padding:6px 12px 6px 0;color:#666;font-size:14px">${k}</td><td style="padding:6px 0;font-weight:bold;font-size:14px">${v}</td></tr>`).join("")}
          </table>
        </div>`
      ),
    ];

    if (body.status === "trial_scheduled" && (body.trialDate || row.trialDate)) {
      const date = body.trialDate || row.trialDate || "";
      const slot = body.trialSlot || "Morning session";
      const customerMsg = `🏏 *Trial Session Confirmed — PIR Cricket Academy*\n\nDear ${row.parentName}, ${row.studentName}'s trial session has been scheduled!\n\n📅 *Date:* ${date}\n⏰ *Time:* ${slot}\n📍 *Venue:* Sector-A, Police Colony, Anisabad, Patna\n\n✅ Please arrive 10 minutes early.\nFor any queries, contact us at +91 ${adminPhone}.\n\n🏏 PIR Cricket Academy — Patna`;
      const customerEmailHtml = `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#0a0f1e;color:#fff;border-radius:12px;overflow:hidden"><div style="background:#eab308;padding:24px;text-align:center"><img src="https://pircricketacademy.co.in/images/pir-logo-400.png" alt="PIR" style="height:64px;width:auto;display:block;margin:0 auto 10px"/><h1 style="margin:0;color:#000;font-size:20px">Trial Session Confirmed!</h1></div><div style="padding:28px"><p style="color:#94a3b8;margin:0 0 20px">Dear <strong style="color:#fff">${row.parentName}</strong>, ${row.studentName}'s trial session has been scheduled at PIR Cricket Academy.</p><table style="width:100%;border-collapse:collapse">${[["Student",row.studentName],["Trial Date",date],["Time",slot],["Venue","Sector-A, Police Colony, Anisabad, Patna"]].map(([k,v])=>`<tr><td style="padding:8px 0;color:#94a3b8;border-bottom:1px solid #1e293b;font-size:14px">${k}</td><td style="padding:8px 0;color:#fff;border-bottom:1px solid #1e293b;font-size:14px;font-weight:bold;text-align:right">${v}</td></tr>`).join("")}</table><p style="color:#94a3b8;margin:24px 0 0;font-size:13px">Please arrive 10 minutes early. For queries, call +91 ${adminPhone}.</p></div></div>`;
      if (row.phone) notifications.push(sendWhatsApp(row.phone, customerMsg));
      if (row.email) notifications.push(sendEmail(row.email, `Trial Session Confirmed — ${date} | PIR Cricket Academy`, customerEmailHtml));
    }

    if (body.status === "joined") {
      const customerMsg = `🎉 *Welcome to PIR Cricket Academy!*\n\nDear ${row.parentName}, we are thrilled to welcome ${row.studentName} to PIR Cricket Academy!\n\n✅ Your admission is confirmed.\n🏏 Age Group: ${row.ageGroup}\n\nPlease contact us at +91 ${adminPhone} to confirm your batch timing and first session details.\n\n🏏 PIR Cricket Academy — Patna`;
      const customerEmailHtml = `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#0a0f1e;color:#fff;border-radius:12px;overflow:hidden"><div style="background:#eab308;padding:24px;text-align:center"><img src="https://pircricketacademy.co.in/images/pir-logo-400.png" alt="PIR" style="height:64px;width:auto;display:block;margin:0 auto 10px"/><h1 style="margin:0;color:#000;font-size:20px">Welcome to PIR Cricket Academy!</h1></div><div style="padding:28px"><p style="color:#94a3b8;margin:0 0 20px">Dear <strong style="color:#fff">${row.parentName}</strong>, we are delighted to confirm that <strong style="color:#fff">${row.studentName}</strong> has been admitted to PIR Cricket Academy.</p><table style="width:100%;border-collapse:collapse">${[["Student",row.studentName],["Age Group",row.ageGroup],["Status","Admitted ✅"]].map(([k,v])=>`<tr><td style="padding:8px 0;color:#94a3b8;border-bottom:1px solid #1e293b;font-size:14px">${k}</td><td style="padding:8px 0;color:#fff;border-bottom:1px solid #1e293b;font-size:14px;font-weight:bold;text-align:right">${v}</td></tr>`).join("")}</table><p style="color:#94a3b8;margin:24px 0 0;font-size:13px">Please contact us at +91 ${adminPhone} to confirm your batch timing and first session date.</p></div></div>`;
      if (row.phone) notifications.push(sendWhatsApp(row.phone, customerMsg));
      if (row.email) notifications.push(sendEmail(row.email, `Welcome to PIR Cricket Academy — Admission Confirmed!`, customerEmailHtml));
    }

    if (body.status === "rejected") {
      const customerMsg = `🏏 *PIR Cricket Academy — Application Update*\n\nDear ${row.parentName}, thank you for your interest in PIR Cricket Academy for ${row.studentName}.\n\nAfter careful review, we are unable to offer admission at this time. This may be due to batch capacity or age group availability.\n\nWe encourage you to reapply in the next intake. For more information, contact us at +91 ${adminPhone}.\n\nThank you for your interest in PIR Cricket Academy.`;
      if (row.phone) notifications.push(sendWhatsApp(row.phone, customerMsg));
      if (row.email) notifications.push(sendEmail(row.email, `Application Update — PIR Cricket Academy`, `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:28px"><h2 style="color:#eab308">PIR Cricket Academy — Application Update</h2><p>Dear ${row.parentName},</p><p>Thank you for your interest in PIR Cricket Academy for <strong>${row.studentName}</strong>.</p><p>After careful review, we are unable to offer admission at this time. This may be due to batch capacity or age group availability.</p><p>We encourage you to reapply in the next intake. For more information, please contact us at +91 ${adminPhone}.</p><p>Thank you for considering PIR Cricket Academy.</p></div>`));
    }

    await Promise.allSettled(notifications);
    return res.json(row);
  }

  if (req.method === "PATCH" && id && action === "mark-paid") {
    try { requireAdminOrReception(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
    const { amount, note } = z.object({ amount: z.number().positive(), note: z.string().optional() }).parse(req.body);
    const [row] = await db.update(admissions).set({
      paymentStatus: "paid", totalPaid: amount, paidAt: new Date(),
      razorpayPaymentId: note || "CASH",
    }).where(eq(admissions.id, id)).returning();
    if (!row) return res.status(404).json({ error: "Admission not found" });
    // Send same notifications as online payment — must await before returning or Vercel kills the function
    try {
      await sendAdmissionNotifications({
        studentName: row.studentName, ageGroup: row.ageGroup, parentName: row.parentName,
        phone: row.phone, email: row.email ?? undefined, isTrial: row.isTrial,
        trialDate: row.trialDate ?? undefined, school: row.school ?? undefined,
        asthma: row.asthma, emergencyName: row.emergencyName, emergencyPhone: row.emergencyPhone,
        dob: row.dob, address: row.address ?? undefined,
        razorpayPaymentId: note || "CASH", admissionId: row.id,
        totalPaid: row.totalPaid, packageMonths: row.packageMonths, combinedDiscountPct: row.combinedDiscountPct,
      });
    } catch (notifErr: any) {
      console.error("[mark-paid] Notification error:", notifErr?.message);
    }
    return res.json(row);
  }

  if (req.method === "DELETE" && id) {
    try { requireAdmin(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
    await db.delete(admissions).where(eq(admissions.id, id));
    return res.json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

// ── Bookings ───────────────────────────────────────────────────────────────────
// All time slots in order — used for duration overlap calculation
const ALL_SLOTS = ["06:00 AM","07:00 AM","08:00 AM","09:00 AM","10:00 AM","11:00 AM","12:00 PM","01:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM","06:00 PM","07:00 PM","08:00 PM","09:00 PM"];

function getOccupiedSlots(startSlot: string, duration: number): string[] {
  const idx = ALL_SLOTS.indexOf(startSlot);
  if (idx === -1) return [startSlot];
  return ALL_SLOTS.slice(idx, idx + duration);
}

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { console.error("[sendEmail] RESEND_API_KEY is not set — email skipped"); return; }
  const fromEmail = process.env.RESEND_FROM_EMAIL || "PIRcricketHub <onboarding@resend.dev>";
  console.log(`[sendEmail] Sending to=${to} from=${fromEmail} subject="${subject}"`);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: fromEmail, to, subject, html }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`[sendEmail] Resend error ${res.status}:`, JSON.stringify(body));
  } else {
    console.log(`[sendEmail] Sent OK id=${(body as any).id}`);
  }
}

async function sendWhatsApp(to: string, message: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";
  if (!sid || !token) return;
  const phone = to.startsWith("+") ? to : `+91${to.replace(/\D/g, "").slice(-10)}`;
  await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      From: from,
      To: `whatsapp:${phone}`,
      Body: message,
    }).toString(),
  });
}

async function sendBookingNotifications(booking: {
  ref: string; name: string; phone: string; email?: string | null;
  facilityName: string; date: string; slot: string; duration: number; total: number;
}) {
  const { ref, name, phone, email, facilityName, date, slot, duration, total } = booking;
  const adminPhone = process.env.ADMIN_PHONE || "7903053204";
  const adminEmail = ADMIN_EMAIL;

  const customerMsg = `✅ *Booking Confirmed!*\n\nHi ${name}, your booking at PIR Cricket Academy is confirmed.\n\n🏟️ *Facility:* ${facilityName}\n📅 *Date:* ${date}\n⏰ *Time:* ${slot}\n⏱️ *Duration:* ${duration} hour${duration > 1 ? "s" : ""}\n💰 *Amount Paid:* ₹${total.toLocaleString()}\n🎫 *Ref:* ${ref}\n\nSee you on the ground! 🏏\n- PIR Cricket Academy`;

  const adminMsg = `🔔 *New Booking Alert!*\n\n👤 *Customer:* ${name}\n📞 *Phone:* ${phone}\n🏟️ *Facility:* ${facilityName}\n📅 *Date:* ${date}\n⏰ *Time:* ${slot}\n⏱️ *Duration:* ${duration} hour${duration > 1 ? "s" : ""}\n💰 *Amount:* ₹${total.toLocaleString()}\n🎫 *Ref:* ${ref}`;

  const customerEmailHtml = `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#0a0f1e;color:#fff;border-radius:12px;overflow:hidden">
      <div style="background:#eab308;padding:24px;text-align:center">
        <h1 style="margin:0;color:#000;font-size:22px">PIR Cricket Academy</h1>
        <p style="margin:4px 0 0;color:#000;font-size:14px">Booking Confirmed ✅</p>
      </div>
      <div style="padding:28px">
        <p style="color:#94a3b8;margin:0 0 20px">Hi <strong style="color:#fff">${name}</strong>, your facility booking is confirmed and payment received.</p>
        <table style="width:100%;border-collapse:collapse">
          ${[["Booking Ref", ref],["Facility", facilityName],["Date", date],["Time", slot],["Duration", `${duration} hour${duration>1?"s":""}`],["Amount Paid", `₹${total.toLocaleString()}`]].map(([k,v])=>`<tr><td style="padding:8px 0;color:#94a3b8;border-bottom:1px solid #1e293b;font-size:14px">${k}</td><td style="padding:8px 0;color:#fff;border-bottom:1px solid #1e293b;font-size:14px;font-weight:bold;text-align:right">${v}</td></tr>`).join("")}
        </table>
        <p style="color:#94a3b8;margin:24px 0 0;font-size:13px">For any queries, WhatsApp us at +91 ${adminPhone}</p>
      </div>
    </div>`;

  const adminEmailHtml = `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
      <h2 style="color:#eab308">🔔 New Booking — PIR Cricket Academy</h2>
      <table style="width:100%;border-collapse:collapse">
        ${[["Customer", name],["Phone", phone],["Email", email||"—"],["Facility", facilityName],["Date", date],["Time", slot],["Duration", `${duration}hr`],["Amount", `₹${total.toLocaleString()}`],["Ref", ref]].map(([k,v])=>`<tr><td style="padding:6px 12px 6px 0;color:#666;font-size:14px">${k}</td><td style="padding:6px 0;font-weight:bold;font-size:14px">${v}</td></tr>`).join("")}
      </table>
    </div>`;

  await Promise.allSettled([
    sendWhatsApp(phone, customerMsg),
    sendWhatsApp(adminPhone, adminMsg),
    email ? sendEmail(email, `Booking Confirmed — ${ref} | PIR Cricket Academy`, customerEmailHtml) : Promise.resolve(),
    sendEmail(adminEmail, `New Booking: ${name} — ${facilityName} on ${date}`, adminEmailHtml),
  ]);
}

async function handleBookings(req: VercelRequest, res: VercelResponse, sub: string[]) {
  const first = sub[0];
  const id = first && first !== "verify" && first !== "slots" ? parseInt(first) : null;
  const action = id ? sub[1] : first;

  // GET /api/bookings/lookup?ref=&phone=  — customer looks up their own booking for cancellation
  if (req.method === "GET" && action === "lookup") {
    const { ref: refQ, phone: phoneQ } = req.query;
    if (!refQ || !phoneQ) return res.status(400).json({ error: "ref and phone required" });
    const [row] = await db.select().from(bookings).where(eq(bookings.ref, refQ as string)).limit(1);
    if (!row) return res.status(404).json({ error: "No booking found with that reference number." });
    const normalise = (p: string) => p.replace(/\D/g, "").slice(-10);
    if (normalise(row.phone) !== normalise(phoneQ as string)) return res.status(403).json({ error: "Phone number does not match this booking." });
    if (row.status !== "confirmed") return res.status(400).json({ error: `This booking cannot be cancelled. Current status: ${row.status.replace(/_/g," ")}` });
    const slotHour = parseInt(row.slot.replace(/[^0-9]/g,"").slice(0,2));
    const isPM = row.slot.includes("PM") && slotHour !== 12;
    const hour24 = isPM ? slotHour + 12 : (row.slot.includes("AM") && slotHour === 12 ? 0 : slotHour);
    const bookingTime = new Date(`${row.date}T${String(hour24).padStart(2,"0")}:00:00+05:30`);
    const hoursUntil = (bookingTime.getTime() - Date.now()) / 3600000;
    if (hoursUntil < 24) return res.status(400).json({ error: "Cancellation window has closed. Bookings can only be cancelled at least 24 hours before the slot." });
    const refundAmount = Math.floor(row.total * 0.9);
    return res.json({ id: row.id, ref: row.ref, facilityName: row.facilityName, date: row.date, slot: row.slot, name: row.name, total: row.total, status: row.status, refundAmount });
  }

  // GET /api/bookings/slots?date=&facility=  — slot availability for frontend
  if (req.method === "GET" && action === "slots") {
    const { date, facility } = req.query;
    if (!date || !facility) return res.status(400).json({ error: "date and facility required" });
    const existing = await db.select().from(bookings)
      .where(eq(bookings.date, date as string));
    const confirmed = existing.filter(b => b.facility === facility && (b.status === "confirmed" || b.status === "pending_payment"));
    const bookedSlots = new Set<string>();
    confirmed.forEach(b => getOccupiedSlots(b.slot, b.duration).forEach(s => bookedSlots.add(s)));
    return res.json({ bookedSlots: Array.from(bookedSlots) });
  }

  // GET /api/bookings?date=YYYY-MM-DD  — receptionist tracker
  if (req.method === "GET") {
    try { requireAdminOrReception(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
    // Auto-expire pending_payment bookings older than 30 minutes
    const expiryCutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    await db.update(bookings)
      .set({ status: "cancelled" })
      .where(and(eq(bookings.status, "pending_payment"), lt(bookings.createdAt, new Date(expiryCutoff))));
    const { date } = req.query;
    const all = date
      ? await db.select().from(bookings).where(eq(bookings.date, date as string))
      : await db.select().from(bookings).orderBy(bookings.createdAt);
    return res.json(date ? all : all.reverse());
  }

  // POST /api/bookings/verify  — confirm payment + send notifications
  if (req.method === "POST" && action === "verify") {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    const expected = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");
    if (expected !== razorpaySignature) {
      return res.status(400).json({ error: "Payment verification failed — signature mismatch" });
    }
    const [row] = await db
      .update(bookings)
      .set({ status: "confirmed", razorpayPaymentId })
      .where(eq(bookings.id, parseInt(bookingId)))
      .returning();

    await sendBookingNotifications(row).catch(() => {});
    return res.json({ ref: row.ref, status: row.status });
  }

  // POST /api/bookings/:id/cancel-request — customer requests cancellation (public, 24hr window)
  // NOTE: must be BEFORE the general POST handler so it isn't swallowed by that catch-all
  if (req.method === "POST" && id && action === "cancel-request") {
    const { phone } = z.object({ phone: z.string().min(1) }).parse(req.body);
    const [row] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1).then(r => r);
    if (!row) return res.status(404).json({ error: "Booking not found" });
    const normalise = (p: string) => p.replace(/\D/g, "").slice(-10);
    if (normalise(row.phone) !== normalise(phone)) return res.status(403).json({ error: "Phone number does not match this booking" });
    if (row.status !== "confirmed") return res.status(400).json({ error: `Booking cannot be cancelled — current status: ${row.status}` });
    const slotHour = parseInt(row.slot.replace(/[^0-9]/g,"").slice(0,2));
    const isPM = row.slot.includes("PM") && slotHour !== 12;
    const hour24 = isPM ? slotHour + 12 : (row.slot.includes("AM") && slotHour === 12 ? 0 : slotHour);
    const bookingTime = new Date(`${row.date}T${String(hour24).padStart(2,"0")}:00:00+05:30`);
    const hoursUntil = (bookingTime.getTime() - Date.now()) / 3600000;
    if (hoursUntil < 24) return res.status(400).json({ error: "Cancellation window has closed. You must cancel at least 24 hours before your slot." });
    const refundAmount = Math.floor(row.total * 0.9);
    const [updated] = await db.update(bookings).set({ status: "cancellation_requested", refundAmount }).where(eq(bookings.id, id)).returning();
    const adminPhone = process.env.ADMIN_PHONE || "7903053204";
    await Promise.allSettled([
      sendWhatsApp(adminPhone, `⚠️ *Cancellation Request — PIR Cricket Academy*\n\n👤 *Customer:* ${row.name}\n📞 *Phone:* ${row.phone}\n🏟️ *Facility:* ${row.facilityName}\n📅 *Date:* ${row.date}\n⏰ *Time:* ${row.slot}\n💰 *Paid:* ₹${row.total.toLocaleString()}\n💸 *Refund Due:* ₹${refundAmount.toLocaleString()} (after 10% deduction)\n🎫 *Ref:* ${row.ref}\n\nLog in to admin panel to process the refund.`),
      sendEmail(ADMIN_EMAIL, `Cancellation Request: ${row.name} — ${row.ref} | PIR Cricket Academy`,
        `<div style="font-family:sans-serif;max-width:500px"><h2 style="color:#f59e0b">⚠️ Cancellation Request</h2><table style="width:100%;border-collapse:collapse">${[["Customer",row.name],["Phone",row.phone],["Facility",row.facilityName],["Date",row.date],["Time",row.slot],["Amount Paid","₹"+row.total.toLocaleString()],["Refund Due","₹"+refundAmount.toLocaleString()+" (10% deducted)"],["Ref",row.ref]].map(([k,v])=>`<tr><td style="padding:6px 12px 6px 0;color:#666;font-size:14px">${k}</td><td style="padding:6px 0;font-weight:bold;font-size:14px">${v}</td></tr>`).join("")}</table><p style="margin-top:16px;color:#666;font-size:13px">Log in to the admin panel to process the refund.</p></div>`
      ),
      row.phone ? sendWhatsApp(row.phone, `✅ *Cancellation Request Received — PIR Cricket Academy*\n\nHi ${row.name}, your cancellation request for:\n\n🏟️ ${row.facilityName}\n📅 ${row.date} · ${row.slot}\n🎫 Ref: ${row.ref}\n\nhas been received. You will receive a refund of *₹${refundAmount.toLocaleString()}* (10% deducted as cancellation fee) within 2–3 business days.\n\nFor queries, contact +91 ${adminPhone}.`) : Promise.resolve(),
    ]);
    return res.json({ ok: true, refundAmount });
  }

  // POST /api/bookings  — check availability + create booking + Razorpay order
  if (req.method === "POST") {
    const data = z.object({
      facility: z.string().min(1), facilityName: z.string().min(1),
      date: z.string().min(1), slot: z.string().min(1),
      duration: z.number().int().positive(), rate: z.number().int().positive(),
      total: z.number().int().positive(), name: z.string().min(1),
      phone: z.string().min(1), email: z.string().email().optional(),
      paymentMethod: z.enum(["online","cash"]).optional().default("online"),
    }).parse(req.body);

    // Server-side slot conflict check
    const existing = await db.select().from(bookings)
      .where(eq(bookings.date, data.date));
    const confirmedForFacility = existing.filter(b => b.facility === data.facility && (b.status === "confirmed" || b.status === "pending_payment"));
    const requestedSlots = getOccupiedSlots(data.slot, data.duration);
    for (const b of confirmedForFacility) {
      const occupied = getOccupiedSlots(b.slot, b.duration);
      const conflict = requestedSlots.some(s => occupied.includes(s));
      if (conflict) {
        return res.status(409).json({ error: `This slot is already booked. Please choose a different time.`, conflictRef: b.ref });
      }
    }

    // Server-side admin block check
    const allBlocks = await db.select().from(blockedSlots);
    const relevantBlocks = allBlocks.filter(b =>
      (b.date === data.date || b.date === "*") &&
      (b.facility === data.facility || b.facility === "all")
    );
    if (relevantBlocks.length > 0) {
      const fullDayBlock = relevantBlocks.find(b => !b.slot);
      if (fullDayBlock) {
        return res.status(409).json({ error: `Bookings are blocked for this date: ${fullDayBlock.reason}` });
      }
      const slotBlock = relevantBlocks.find(b => b.slot && requestedSlots.includes(b.slot));
      if (slotBlock) {
        return res.status(409).json({ error: `The ${slotBlock.slot} slot is blocked: ${slotBlock.reason}` });
      }
    }

    const ref = "PIR" + crypto.randomBytes(4).toString("hex").toUpperCase();

    // Cash payment — skip Razorpay, confirm immediately
    if (data.paymentMethod === "cash") {
      const [row] = await db.insert(bookings).values({
        facility: data.facility, facilityName: data.facilityName,
        date: data.date, slot: data.slot, duration: data.duration,
        rate: data.rate, total: data.total, name: data.name,
        phone: data.phone, email: data.email,
        ref, status: "confirmed",
      }).returning();
      await sendBookingNotifications(row).catch(() => {});
      return res.status(201).json({ bookingId: row.id, ref: row.ref });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    if (!keyId || !keySecret) return res.status(500).json({ error: "Razorpay keys not configured" });

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: data.total * 100, currency: "INR", receipt: ref }),
    });
    if (!orderRes.ok) {
      const err = await orderRes.text();
      return res.status(500).json({ error: "Failed to create payment order", detail: err });
    }
    const order = await (orderRes.json() as Promise<{ id: string }>);
    const [row] = await db.insert(bookings).values({
      facility: data.facility, facilityName: data.facilityName,
      date: data.date, slot: data.slot, duration: data.duration,
      rate: data.rate, total: data.total, name: data.name,
      phone: data.phone, email: data.email,
      ref, razorpayOrderId: order.id, status: "pending_payment",
    }).returning();
    // Do NOT confirm or notify here — confirmation happens in /verify after payment succeeds
    return res.status(201).json({ bookingId: row.id, orderId: order.id, amount: data.total * 100, keyId, ref });
  }

  // PATCH /api/bookings/:id/status
  if (req.method === "PATCH" && id && action === "status") {
    try { requireAdmin(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
    const { status } = z.object({ status: z.enum(["pending_payment","confirmed","cancelled","refunded"]) }).parse(req.body);
    const [row] = await db.update(bookings).set({ status }).where(eq(bookings.id, id)).returning();
    // Notify customer when booking is cancelled or refunded
    if (status === "cancelled" || status === "refunded") {
      const adminPhone = process.env.ADMIN_PHONE || "7903053204";
      const label = status === "cancelled" ? "Cancelled" : "Refunded";
      await Promise.allSettled([
        row.phone ? sendWhatsApp(row.phone, `❌ *Booking ${label} — PIR Cricket Academy*\n\nHi ${row.name}, your booking has been ${status}.\n\n🏟️ *Facility:* ${row.facilityName}\n📅 *Date:* ${row.date}\n⏰ *Time:* ${row.slot}\n🎫 *Ref:* ${row.ref}\n\nFor queries, contact us at +91 ${adminPhone}. We apologise for any inconvenience.`) : Promise.resolve(),
        row.email ? sendEmail(row.email, `Booking ${label} — ${row.ref} | PIR Cricket Academy`,
          `<div style="font-family:sans-serif;max-width:500px;margin:0 auto"><h2 style="color:#ef4444">Booking ${label}</h2><p>Hi ${row.name}, your booking has been ${status}.</p><table style="width:100%;border-collapse:collapse">${[["Ref",row.ref],["Facility",row.facilityName],["Date",row.date],["Time",row.slot]].map(([k,v])=>`<tr><td style="padding:6px 12px 6px 0;color:#666;font-size:14px">${k}</td><td style="padding:6px 0;font-weight:bold;font-size:14px">${v}</td></tr>`).join("")}</table><p style="color:#666;font-size:13px;margin-top:16px">For queries call +91 ${adminPhone}.</p></div>`
        ) : Promise.resolve(),
        sendEmail(ADMIN_EMAIL, `Booking ${label}: ${row.name} — ${row.ref} | PIR Cricket Academy`,
          `<div style="font-family:sans-serif;max-width:500px"><h2 style="color:#ef4444">Booking ${label}</h2><p>Booking <strong>${row.ref}</strong> for <strong>${row.name}</strong> (${row.phone}) has been marked as <strong>${status}</strong>.</p></div>`
        ),
      ]);
    }
    return res.json(row);
  }

  // PATCH /api/bookings/:id/mark-paid — mark cash/manual payment as confirmed
  if (req.method === "PATCH" && id && action === "mark-paid") {
    try { requireAdminOrReception(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
    const { note } = z.object({ note: z.string().optional() }).parse(req.body);
    const [row] = await db.update(bookings).set({
      status: "confirmed",
      razorpayPaymentId: note || "CASH",
    }).where(eq(bookings.id, id)).returning();
    // Send booking notifications (same as online payment)
    await sendBookingNotifications(row).catch(() => {});
    return res.json(row);
  }

  // PATCH /api/bookings/:id/discount — admin sets or removes a discount on a booking
  if (req.method === "PATCH" && id && action === "discount") {
    try { requireAdmin(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
    const { discountPct, discountNote } = z.object({
      discountPct: z.number().int().min(0).max(100),
      discountNote: z.string().optional(),
    }).parse(req.body);
    const [existing] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
    if (!existing) return res.status(404).json({ error: "Booking not found" });
    const discountedTotal = discountPct > 0 ? Math.round(existing.total * (1 - discountPct / 100)) : null;
    const [row] = await db.update(bookings).set({
      discountPct,
      discountedTotal,
      discountNote: discountNote || null,
    }).where(eq(bookings.id, id)).returning();
    return res.json(row);
  }

  // PATCH /api/bookings/:id/process-refund — admin marks refund as processed
  if (req.method === "PATCH" && id && action === "process-refund") {
    try { requireAdminOrReception(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
    const { refundNote } = z.object({ refundNote: z.string().optional() }).parse(req.body);
    const [row] = await db.update(bookings).set({
      status: "refunded", refundAt: new Date(), refundNote: refundNote || null,
    }).where(eq(bookings.id, id)).returning();
    if (!row) return res.status(404).json({ error: "Booking not found" });
    const adminPhone = process.env.ADMIN_PHONE || "7903053204";
    await Promise.allSettled([
      row.phone ? sendWhatsApp(row.phone, `💸 *Refund Processed — PIR Cricket Academy*\n\nHi ${row.name}, your refund of *₹${(row.refundAmount||0).toLocaleString()}* for booking ${row.ref} has been processed.\n\n${refundNote ? `📝 Note: ${refundNote}\n\n` : ""}Please allow 2–3 business days for the amount to reflect. For queries, contact +91 ${adminPhone}.`) : Promise.resolve(),
      row.email ? sendEmail(row.email, `Refund Processed — ${row.ref} | PIR Cricket Academy`,
        `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#0a0f1e;color:#fff;border-radius:12px;overflow:hidden"><div style="background:#eab308;padding:24px;text-align:center"><img src="https://pircricketacademy.co.in/images/pir-logo-400.png" alt="PIR" style="height:64px;width:auto;display:block;margin:0 auto 10px"/><h1 style="margin:0;color:#000;font-size:20px">Refund Processed</h1></div><div style="padding:28px"><table style="width:100%;border-collapse:collapse">${[["Booking Ref",row.ref],["Facility",row.facilityName],["Date",row.date],["Refund Amount","₹"+(row.refundAmount||0).toLocaleString()],["Note",refundNote||"—"]].map(([k,v])=>`<tr><td style="padding:8px 0;color:#94a3b8;border-bottom:1px solid #1e293b;font-size:14px">${k}</td><td style="padding:8px 0;color:#fff;border-bottom:1px solid #1e293b;font-size:14px;font-weight:bold;text-align:right">${v}</td></tr>`).join("")}</table><p style="color:#94a3b8;margin:24px 0 0;font-size:13px">Allow 2–3 business days for the refund to reflect in your account.</p></div></div>`
      ) : Promise.resolve(),
      sendEmail(ADMIN_EMAIL, `Refund Processed: ${row.name} — ₹${(row.refundAmount||0).toLocaleString()} | PIR Cricket Academy`,
        `<div style="font-family:sans-serif;max-width:500px"><h2 style="color:#22c55e">✅ Refund Processed</h2><table style="width:100%;border-collapse:collapse">${[["Customer",row.name],["Ref",row.ref],["Refund Amount","₹"+(row.refundAmount||0).toLocaleString()],["Note",refundNote||"—"]].map(([k,v])=>`<tr><td style="padding:6px 12px 6px 0;color:#666;font-size:14px">${k}</td><td style="padding:6px 0;font-weight:bold;font-size:14px">${v}</td></tr>`).join("")}</table></div>`
      ),
    ]);
    return res.json(row);
  }

  // DELETE /api/bookings/:id — delete a single booking (admin only)
  if (req.method === "DELETE" && id) {
    try { requireAdmin(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
    await db.delete(bookings).where(eq(bookings.id, id));
    return res.json({ ok: true });
  }

  // DELETE /api/bookings/cleanup?days=30  — delete past bookings older than N days (admin only)
  if (req.method === "DELETE" && action === "cleanup") {
    try { requireAdmin(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
    const days = parseInt((req.query.days as string) || "30");
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split("T")[0]; // YYYY-MM-DD
    const deleted = await db.delete(bookings)
      .where(lt(bookings.date, cutoffStr))
      .returning();
    return res.json({ deleted: deleted.length, cutoff: cutoffStr, message: `Deleted ${deleted.length} bookings before ${cutoffStr}` });
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
    try { requireAdmin(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
    const data = z.object({
      name: z.string().min(1), ageGroup: z.string().min(1),
      schedule: z.string().min(1), coachName: z.string().min(1),
      maxStudents: z.number().int().positive().default(25), isActive: z.boolean().default(true),
    }).parse(req.body);
    const [row] = await db.insert(batches).values(data).returning();
    return res.status(201).json(row);
  }
  if (req.method === "PATCH" && id) {
    try { requireAdmin(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
    const data = z.object({
      name: z.string().min(1).optional(), ageGroup: z.string().optional(),
      schedule: z.string().optional(), coachName: z.string().optional(),
      maxStudents: z.number().int().positive().optional(), isActive: z.boolean().optional(),
    }).parse(req.body);
    const [row] = await db.update(batches).set(data).where(eq(batches.id, id)).returning();
    return res.json(row);
  }
  return res.status(405).json({ error: "Method not allowed" });
}

// ── Students ───────────────────────────────────────────────────────────────────
async function handleStudents(req: VercelRequest, res: VercelResponse, sub: string[]) {
  try { requireAdminOrReception(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
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
    // Return existing student only if same phone AND same name (allows siblings with shared parent phone)
    const normPhone = data.phone.replace(/\D/g, "").slice(-10);
    const normName = data.name.trim().toLowerCase();
    const allStudents = await db.select().from(students);
    const existing = allStudents.find(s =>
      s.phone.replace(/\D/g, "").slice(-10) === normPhone &&
      s.name.trim().toLowerCase() === normName
    );
    if (existing) return res.status(200).json(existing);
    const qrToken = crypto.randomUUID();
    const [row] = await db.insert(students).values({ ...data, qrToken }).returning();
    return res.status(201).json(row);
  }
  if (req.method === "PATCH" && id) {
    const data = z.object({
      name: z.string().min(1).optional(), dob: z.string().optional(),
      ageGroup: z.string().optional(), batchId: z.number().int().positive().optional().nullable(),
      parentName: z.string().optional(), phone: z.string().optional(),
      email: z.string().optional(), address: z.string().optional(),
      bloodGroup: z.string().optional(), status: z.string().optional(),
    }).parse(req.body);
    const [row] = await db.update(students).set(data).where(eq(students.id, id)).returning();
    return res.json(row);
  }
  return res.status(405).json({ error: "Method not allowed" });
}

// ── Attendance ─────────────────────────────────────────────────────────────────
async function handleAttendance(req: VercelRequest, res: VercelResponse) {
  try { requireStaff(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
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
    // Prevent duplicate attendance for the same student on the same day
    const [existing] = await db.select().from(attendance)
      .where(and(eq(attendance.studentId, studentId), eq(attendance.sessionDate, data.sessionDate)));
    if (existing) {
      const [s] = await db.select().from(students).where(eq(students.id, studentId));
      return res.status(409).json({ error: "Already marked for today", student: s ? { name: s.name, status: existing.status } : undefined });
    }
    const [row] = await db.insert(attendance).values({
      studentId, batchId: data.batchId ?? null,
      sessionDate: data.sessionDate, status: data.status,
      markedBy: data.markedBy, notes: data.notes ?? null,
    }).returning();
    const [s] = await db.select().from(students).where(eq(students.id, studentId));
    return res.status(201).json({ ...row, student: s ? { name: s.name } : undefined });
  }
  return res.status(405).json({ error: "Method not allowed" });
}

// ── Session Notes ──────────────────────────────────────────────────────────────
async function handleSessionNotes(req: VercelRequest, res: VercelResponse) {
  try { requireStaff(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
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
  try { requireStaff(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
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
  try { requireAdmin(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
  const isBulkRemind = sub[0] === "bulk-remind";
  const id = (!isBulkRemind && sub[0]) ? parseInt(sub[0]) : null;
  const action = sub[1]; // e.g. "remind"

  if (req.method === "GET") {
    const { studentId } = req.query as Record<string, string>;
    if (studentId) {
      const all = await db.select().from(fees).where(eq(fees.studentId, parseInt(studentId))).orderBy(fees.month);
      return res.json(all.reverse());
    }
    const all = await db.select({ fee: fees, student: students })
      .from(fees).leftJoin(students, eq(fees.studentId, students.id)).orderBy(fees.createdAt);
    return res.json(all.reverse());
  }

  if (req.method === "POST" && id && action === "remind") {
    // Send WhatsApp reminder for a specific fee
    const [row] = await db.select({ fee: fees, student: students })
      .from(fees).leftJoin(students, eq(fees.studentId, students.id)).where(eq(fees.id, id));
    if (!row) return res.status(404).json({ error: "Fee not found" });
    const { fee, student } = row;
    if (!student) return res.status(404).json({ error: "Student not found" });
    const adminPhone = process.env.ADMIN_PHONE || "7903053204";
    const msg = `⚠️ *Fee Reminder — PIR Cricket Academy*\n\nDear Parent,\n\n📋 *Student:* ${student.name}\n💰 *Amount Due:* ₹${(fee.amount - fee.paidAmount).toLocaleString("en-IN")}\n📅 *Due Date:* ${fee.dueDate || "Please pay soon"}\n📌 *Type:* ${fee.feeType}\n\nPlease clear this payment at your earliest. For queries, contact us on +91 ${adminPhone}.\n\n🏏 PIR Cricket Academy — Patna`;
    await sendWhatsApp(student.phone, msg);
    return res.json({ ok: true });
  }

  if (req.method === "POST" && isBulkRemind) {
    // Send reminders to all overdue/due students
    const today = new Date().toISOString().split("T")[0];
    const all = await db.select({ fee: fees, student: students })
      .from(fees).leftJoin(students, eq(fees.studentId, students.id));
    const overdue = all.filter(r => !r.fee.paid && r.student);
    const adminPhone = process.env.ADMIN_PHONE || "7903053204";
    await Promise.allSettled(overdue.map(({ fee, student }) => {
      const msg = `⚠️ *Fee Reminder — PIR Cricket Academy*\n\nDear Parent,\n\n📋 *Student:* ${student!.name}\n💰 *Amount Due:* ₹${(fee.amount - fee.paidAmount).toLocaleString("en-IN")}\n📅 *Due Date:* ${fee.dueDate || "Overdue"}\n\nKindly clear this payment immediately. Contact: +91 ${adminPhone}\n\n🏏 PIR Cricket Academy`;
      return sendWhatsApp(student!.phone, msg);
    }));
    return res.json({ sent: overdue.length });
  }

  if (req.method === "POST") {
    const data = z.object({
      studentId: z.number().int().positive(),
      feeType: z.enum(["monthly","admission","quarterly","annual","camp","tournament"]).default("monthly"),
      month: z.string().min(1),
      amount: z.number().int().positive(),
      paidAmount: z.number().int().min(0).default(0),
      paid: z.boolean().default(false),
      dueDate: z.string().optional().nullable(),
      paidDate: z.string().optional().nullable(),
      receiptNo: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
    }).parse(req.body);
    const [row] = await db.insert(fees).values(data).returning();
    return res.status(201).json(row);
  }

  if (req.method === "PATCH" && id) {
    const data = z.object({
      paid: z.boolean().optional(),
      paidAmount: z.number().int().min(0).optional(),
      paidDate: z.string().optional().nullable(),
      receiptNo: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
      dueDate: z.string().optional().nullable(),
    }).partial().parse(req.body);
    const [row] = await db.update(fees).set(data).where(eq(fees.id, id)).returning();
    // If fee just marked as paid, notify parent (WhatsApp + email) and admin (email)
    if (data.paid === true) {
      const [studentRow] = await db.select().from(students).where(eq(students.id, row.studentId));
      if (studentRow) {
        const adminPhone = process.env.ADMIN_PHONE || "7903053204";
        const feeHtml = `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#0a0f1e;color:#fff;border-radius:12px;overflow:hidden">
          <div style="background:#eab308;padding:24px;text-align:center">
            <img src="https://pircricketacademy.co.in/images/pir-logo-400.png" alt="PIR Cricket Academy" style="height:64px;width:auto;display:block;margin:0 auto 10px"/>
            <h1 style="margin:0;color:#000;font-size:22px">PIR Cricket Academy</h1>
            <p style="margin:4px 0 0;color:#000;font-size:14px">Fee Payment Received ✅</p>
          </div>
          <div style="padding:28px">
            <table style="width:100%;border-collapse:collapse">
              ${[["Student",studentRow.name],["Month",row.month],["Fee Type",row.feeType],["Amount Paid","₹"+row.paidAmount.toLocaleString("en-IN")],["Date",row.paidDate||new Date().toISOString().split("T")[0]],["Receipt",row.receiptNo||"—"]].map(([k,v])=>`<tr><td style="padding:8px 0;color:#94a3b8;border-bottom:1px solid #1e293b;font-size:14px">${k}</td><td style="padding:8px 0;color:#fff;border-bottom:1px solid #1e293b;font-size:14px;font-weight:bold;text-align:right">${v}</td></tr>`).join("")}
            </table>
            <p style="color:#94a3b8;margin:24px 0 0;font-size:13px">Thank you for your payment. For queries, WhatsApp us at +91 ${adminPhone}</p>
          </div>
        </div>`;
        const adminFeeHtml = `<div style="font-family:sans-serif;max-width:500px"><h2 style="color:#eab308">💰 Fee Payment Recorded — PIR Cricket Academy</h2><table style="width:100%;border-collapse:collapse">${[["Student",studentRow.name],["Phone",studentRow.phone||"—"],["Month",row.month],["Fee Type",row.feeType],["Amount Paid","₹"+row.paidAmount.toLocaleString("en-IN")],["Receipt",row.receiptNo||"—"]].map(([k,v])=>`<tr><td style="padding:6px 12px 6px 0;color:#666;font-size:14px">${k}</td><td style="padding:6px 0;font-weight:bold;font-size:14px">${v}</td></tr>`).join("")}</table></div>`;
        await Promise.allSettled([
          studentRow.phone ? sendWhatsApp(studentRow.phone, `✅ *Fee Payment Received — PIR Cricket Academy*\n\n📋 *Student:* ${studentRow.name}\n💰 *Amount Paid:* ₹${row.paidAmount.toLocaleString("en-IN")}\n📌 *Type:* ${row.feeType}\n📅 *Month:* ${row.month}${row.receiptNo ? `\n🧾 *Receipt:* ${row.receiptNo}` : ""}\n\nThank you! For queries, contact +91 ${adminPhone}.\n\n🏏 PIR Cricket Academy`) : Promise.resolve(),
          studentRow.email ? sendEmail(studentRow.email, `Fee Payment Received — ${row.month} | PIR Cricket Academy`, feeHtml) : Promise.resolve(),
          sendEmail(ADMIN_EMAIL, `Fee Paid: ${studentRow.name} — ${row.month} (₹${row.paidAmount.toLocaleString("en-IN")})`, adminFeeHtml),
        ]);
      }
    }
    return res.json(row);
  }

  if (req.method === "DELETE" && id) {
    await db.delete(fees).where(eq(fees.id, id));
    return res.json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

// ── Notifications ──────────────────────────────────────────────────────────────
async function handleNotifications(req: VercelRequest, res: VercelResponse) {
  // GET — admin or receptionist can read broadcasts
  if (req.method === "GET") {
    try { requireAdminOrReception(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
    const all = await db.select().from(notifications).orderBy(notifications.createdAt);
    return res.json(all.reverse());
  }
  // POST — admin or receptionist can broadcast
  if (req.method === "POST") {
    try { requireAdminOrReception(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
    const data = z.object({
      title: z.string().min(1), message: z.string().min(1),
      audience: z.string().default("all"), createdBy: z.string().min(1),
    }).parse(req.body);
    const [row] = await db.insert(notifications).values(data).returning();
    return res.status(201).json(row);
  }
  if (req.method === "DELETE") {
    try { requireAdmin(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
    const pathStr = Array.isArray(req.query._p) ? req.query._p[0] : req.query._p ?? "";
    const [, id] = pathStr.split("/");
    if (!id) return res.status(400).json({ error: "id required" });
    await db.delete(notifications).where(eq(notifications.id, parseInt(id)));
    return res.json({ ok: true });
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
    db.select().from(attendance).where(inArray(attendance.studentId, studentIds)).orderBy(attendance.sessionDate),
    db.select().from(fees).where(inArray(fees.studentId, studentIds)),
    db.select().from(playerRatings).where(inArray(playerRatings.studentId, studentIds)).orderBy(playerRatings.sessionDate),
    db.select().from(notifications).orderBy(notifications.createdAt),
  ]);
  return res.json({
    students: studentList,
    attendance: attRecs.reverse().slice(0, 30),
    fees: feeRecs,
    ratings: ratingRecs.reverse().slice(0, 10),
    notices: noticeList.slice(0, 5),
  });
}

// ── Student Portal ────────────────────────────────────────────────────────────
async function handleStudentPortal(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const { phone, studentId } = req.query as Record<string, string>;
  if (!phone) return res.status(400).json({ error: "phone required" });
  // Normalize: strip all non-digits, keep last 10 digits for matching
  const digits = phone.replace(/\D/g, "").slice(-10);
  const allStudents = await db.select({ student: students, batch: batches })
    .from(students).leftJoin(batches, eq(students.batchId, batches.id));
  const matchingStudents = allStudents.filter(r => r.student.phone.replace(/\D/g, "").slice(-10) === digits);
  if (matchingStudents.length === 0) return res.status(404).json({ error: "No student found for this phone number" });

  // Multiple students on same phone — return list for picker unless a specific id is chosen
  if (matchingStudents.length > 1 && !studentId) {
    return res.json({
      multipleStudents: true,
      students: matchingStudents.map(r => ({ id: r.student.id, name: r.student.name, ageGroup: r.student.ageGroup, status: r.student.status, batchName: r.batch?.name || null })),
    });
  }

  const row = studentId
    ? matchingStudents.find(r => r.student.id === parseInt(studentId))
    : matchingStudents[0];
  if (!row) return res.status(404).json({ error: "Student not found" });
  const sid = row.student.id;

  // Find admission by phone + name; fall back to phone-only for single-student families
  const allAdmissions = await db.select().from(admissions);
  const admissionRec = allAdmissions.find(a =>
    a.phone.replace(/\D/g, "").slice(-10) === digits &&
    a.studentName.trim().toLowerCase() === row.student.name.trim().toLowerCase()
  ) ?? allAdmissions.find(a => a.phone.replace(/\D/g, "").slice(-10) === digits);

  const [attRecs, feeRecs, ratingRecs, noticeList] = await Promise.all([
    db.select().from(attendance).where(eq(attendance.studentId, sid)).orderBy(attendance.sessionDate),
    db.select().from(fees).where(eq(fees.studentId, sid)).orderBy(fees.createdAt),
    db.select().from(playerRatings).where(eq(playerRatings.studentId, sid)).orderBy(playerRatings.sessionDate),
    db.select().from(notifications).orderBy(notifications.createdAt),
  ]);

  // Inject registration fee from admissions table as a synthetic fee entry
  const syntheticFees: any[] = [];
  if (admissionRec) {
    const regAmount = admissionRec.totalPaid || admissionRec.registrationFee || 5000;
    const isPaid = admissionRec.paymentStatus === "paid";
    syntheticFees.push({
      id: -1,
      studentId: sid,
      feeType: "admission",
      month: admissionRec.createdAt ? new Date(admissionRec.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "Registration",
      amount: regAmount,
      paidAmount: isPaid ? regAmount : 0,
      paid: isPaid,
      dueDate: null,
      paidDate: admissionRec.paidAt ? new Date(admissionRec.paidAt).toLocaleDateString("en-IN") : null,
      receiptNo: admissionRec.razorpayPaymentId || (isPaid ? "CASH" : null),
      notes: `Registration fee${admissionRec.combinedDiscountPct ? ` · ${admissionRec.combinedDiscountPct}% discount applied` : ""}`,
      createdAt: admissionRec.createdAt,
    });
  }

  const allFees = [...syntheticFees, ...feeRecs.reverse()];
  const present = attRecs.filter(a => a.status === "present" || a.status === "late").length;
  const paidFees = allFees.filter(f => f.paid).reduce((s: number, f: any) => s + f.amount, 0);
  const pendingFees = allFees.filter(f => !f.paid).reduce((s: number, f: any) => s + (f.amount - (f.paidAmount || 0)), 0);

  return res.json({
    student: row.student,
    batch: row.batch,
    attendance: attRecs.reverse().slice(0, 30),
    fees: allFees,
    ratings: ratingRecs.reverse().slice(0, 10),
    notices: noticeList.slice(0, 10),
    stats: {
      totalSessions: attRecs.length,
      presentCount: present,
      attendancePct: attRecs.length ? Math.round((present / attRecs.length) * 100) : 0,
      paidFees, pendingFees,
    },
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
  try { requireAdmin(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
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
  try { requireAdmin(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
  if (req.method === "GET") {
    const { preview, audience, message } = req.query as Record<string, string>;
    if (preview === "1" && audience && message) {
      const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
      type RecipientRow = { id: number; name: string; parentName: string; phone: string; batchName: string; source: string };
      const rows: RecipientRow[] = [];

      // Pull from enrolled students table
      if (!audience.startsWith("admissions")) {
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
        targets.forEach(({ student, batch }) => rows.push({ id: student.id, name: student.name, parentName: student.parentName, phone: student.phone, batchName: batch?.name || "General", source: "student" }));
      }

      // Pull from admissions table (all submissions regardless of payment status)
      // Dedup by phone+name so siblings sharing a parent phone both appear
      if (audience === "all" || audience === "admissions" || rows.length === 0) {
        const admList = await db.select().from(admissions);
        const seenKeys = new Set(rows.map(r => `${r.phone.replace(/\D/g, "").slice(-10)}|${r.name.trim().toLowerCase()}`));
        admList.forEach((a, i) => {
          const key = `${a.phone.replace(/\D/g, "").slice(-10)}|${a.studentName.trim().toLowerCase()}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            rows.push({ id: -(i + 1), name: a.studentName, parentName: a.parentName, phone: a.phone, batchName: a.ageGroup || "General", source: "admission" });
          }
        });
      }

      const resolved = rows.map(r => {
        const vars = { childName: r.name, parentName: r.parentName, phone: r.phone, batch: r.batchName, date: today };
        const phone10 = r.phone.replace(/\D/g, "").slice(-10);
        return {
          studentId: r.id, name: r.name, parentName: r.parentName,
          phone: r.phone, batch: r.batchName,
          message: resolveVars(message, vars),
          whatsappUrl: `https://wa.me/91${phone10}?text=${encodeURIComponent(resolveVars(message, vars))}`,
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
  if (req.method !== "GET") {
    try { requireAdmin(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
  }
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

// ── Users (coach / student account management) ────────────────────────────────
async function handleUsers(req: VercelRequest, res: VercelResponse, sub: string[]) {
  try { requireAdmin(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }

  const id = sub[0] ? parseInt(sub[0]) : null;
  const action = sub[1]; // e.g. "reset-password"

  // PATCH /api/users/:id/reset-password
  if (req.method === "PATCH" && id && action === "reset-password") {
    const { password } = z.object({ password: z.string().min(6) }).parse(req.body);
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.username === "admin") return res.status(403).json({ error: "Cannot reset super admin password here" });
    const passwordHash = await bcrypt.hash(password, 10);
    const [row] = await db.update(users).set({ passwordHash, plainPassword: password })
      .where(eq(users.id, id))
      .returning({ id: users.id, username: users.username, role: users.role, name: users.name, plainPassword: users.plainPassword, createdAt: users.createdAt });
    return res.json(row);
  }

  if (req.method === "GET") {
    const all = await db.select({ id: users.id, username: users.username, role: users.role, name: users.name, plainPassword: users.plainPassword, createdAt: users.createdAt })
      .from(users).orderBy(users.createdAt);
    return res.json(all);
  }
  if (req.method === "POST") {
    const data = z.object({
      username: z.string().min(3), password: z.string().min(6),
      name: z.string().min(1), role: z.enum(["coach", "admin", "student", "receptionist"]),
    }).parse(req.body);
    const existing = await db.select().from(users).where(eq(users.username, data.username));
    if (existing.length > 0) return res.status(409).json({ error: "Username already exists" });
    if (data.role === "receptionist") {
      const existingRec = await db.select().from(users).where(eq(users.role, "receptionist"));
      if (existingRec.length > 0) return res.status(409).json({ error: "A receptionist account already exists. Delete the existing one before creating a new one." });
    }
    const passwordHash = await bcrypt.hash(data.password, 10);
    const [row] = await db.insert(users).values({ username: data.username, passwordHash, plainPassword: data.password, name: data.name, role: data.role }).returning({
      id: users.id, username: users.username, role: users.role, name: users.name, plainPassword: users.plainPassword, createdAt: users.createdAt,
    });
    return res.status(201).json(row);
  }
  if (req.method === "DELETE") {
    if (!id) return res.status(400).json({ error: "id required" });
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (user?.username === "admin") return res.status(403).json({ error: "Cannot delete super admin" });
    await db.delete(users).where(eq(users.id, id));
    return res.json({ ok: true });
  }
  return res.status(405).json({ error: "Method not allowed" });
}

// ── Discount Types (admin CRUD) ───────────────────────────────────────────────
// ── Fee Packages (admin-managed) ─────────────────────────────────────────────
export async function handlePackages(req: VercelRequest, res: VercelResponse) {
  const pathStr = Array.isArray(req.query._p) ? req.query._p[0] : req.query._p ?? "";
  const [, id] = pathStr.split("/");

  if (req.method === "GET") {
    const rows = await db.select().from(feePackages).orderBy(feePackages.sortOrder, feePackages.months);
    return res.json(rows);
  }
  if (req.method === "POST") {
    try { requireAdmin(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
    const data = z.object({
      months: z.number().int().min(1),
      label: z.string().min(1),
      discountPct: z.number().int().min(0).max(100),
      isActive: z.boolean().default(true),
      sortOrder: z.number().int().default(0),
    }).parse(req.body);
    const [row] = await db.insert(feePackages).values(data).returning();
    return res.status(201).json(row);
  }
  if (req.method === "PATCH") {
    try { requireAdmin(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
    if (!id) return res.status(400).json({ error: "id required" });
    const data = z.object({
      months: z.number().int().min(1).optional(),
      label: z.string().min(1).optional(),
      discountPct: z.number().int().min(0).max(100).optional(),
      isActive: z.boolean().optional(),
      sortOrder: z.number().int().optional(),
    }).parse(req.body);
    const [row] = await db.update(feePackages).set(data).where(eq(feePackages.id, parseInt(id))).returning();
    return res.json(row);
  }
  if (req.method === "DELETE") {
    try { requireAdmin(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
    if (!id) return res.status(400).json({ error: "id required" });
    await db.delete(feePackages).where(eq(feePackages.id, parseInt(id)));
    return res.json({ ok: true });
  }
  return res.status(405).json({ error: "Method not allowed" });
}

export async function handleDiscountTypes(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const all = await db.select().from(discountTypes).orderBy(discountTypes.id);
    // Server computes the pre-opening flag so client devices never use a stale cached date
    const PRE_OPENING_DEADLINE = new Date("2026-08-25T23:59:59+05:30");
    const preOpeningActive = Date.now() < PRE_OPENING_DEADLINE.getTime();
    return res.json({ discounts: all, preOpeningActive });
  }
  if (req.method === "POST") {
    requireAdmin(req);
    const data = z.object({
      name: z.string().min(1),
      percentage: z.number().int().min(1).max(100),
      description: z.string().min(1),
      requiredDocument: z.string().min(1),
      isActive: z.boolean().default(true),
    }).parse(req.body);
    const [row] = await db.insert(discountTypes).values(data).returning();
    return res.status(201).json(row);
  }
  if (req.method === "PATCH") {
    requireAdmin(req);
    const [, id] = (Array.isArray(req.query._p) ? req.query._p[0] : req.query._p ?? "").split("/");
    if (!id) return res.status(400).json({ error: "id required" });
    const data = z.object({
      name: z.string().min(1).optional(),
      percentage: z.number().int().min(1).max(100).optional(),
      description: z.string().min(1).optional(),
      requiredDocument: z.string().min(1).optional(),
      isActive: z.boolean().optional(),
    }).parse(req.body);
    const [row] = await db.update(discountTypes).set(data).where(eq(discountTypes.id, parseInt(id))).returning();
    return res.json(row);
  }
  if (req.method === "DELETE") {
    requireAdmin(req);
    const [, id] = (Array.isArray(req.query._p) ? req.query._p[0] : req.query._p ?? "").split("/");
    if (!id) return res.status(400).json({ error: "id required" });
    await db.delete(discountTypes).where(eq(discountTypes.id, parseInt(id)));
    return res.json({ ok: true });
  }
  return res.status(405).json({ error: "Method not allowed" });
}

// ── Discount Applications (student applies, admin approves) ───────────────────
export async function handleDiscountApplications(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    requireStaff(req);
    const rows = await db.select().from(discountApplications).orderBy(discountApplications.createdAt);
    return res.json(rows);
  }
  if (req.method === "POST") {
    // Public — student submits application
    const data = z.object({
      studentId: z.number().int().positive(),
      discountTypeId: z.number().int().positive(),
      documentUrl: z.string().optional(),
      documentName: z.string().optional(),
    }).parse(req.body);
    // Max 2 discounts per student: 1 eligibility + 1 package. Only one eligibility discount application allowed.
    const existing = await db.select().from(discountApplications)
      .where(eq(discountApplications.studentId, data.studentId));
    const active = existing.find(a => a.status === "pending" || a.status === "approved");
    if (active) return res.status(409).json({ error: "Maximum 2 discounts allowed per student (1 eligibility + 1 package). This student already has an active eligibility discount applied." });
    // Pre-opening discount (id=4) is auto-approved — no document review needed
    const PRE_OPENING_ID = 4;
    const PRE_OPENING_DEADLINE = new Date("2026-08-20");
    const isAutoApprove = data.discountTypeId === PRE_OPENING_ID && new Date() < PRE_OPENING_DEADLINE;
    const status = isAutoApprove ? "approved" : "pending";
    const [row] = await db.insert(discountApplications).values({
      ...data,
      status,
      ...(isAutoApprove ? { reviewNotes: "Auto-approved: Pre-Opening Founding Batch discount (date verified)", reviewedBy: "system", reviewedAt: new Date() } : {}),
    }).returning();
    return res.status(201).json(row);
  }
  if (req.method === "PATCH") {
    const claims = requireAdmin(req);
    const [, id] = (Array.isArray(req.query._p) ? req.query._p[0] : req.query._p ?? "").split("/");
    if (!id) return res.status(400).json({ error: "id required" });
    const data = z.object({
      status: z.enum(["approved", "rejected"]),
      reviewNotes: z.string().optional(),
    }).parse(req.body);
    const [row] = await db.update(discountApplications).set({
      status: data.status,
      reviewNotes: data.reviewNotes,
      reviewedBy: claims.username,
      reviewedAt: new Date(),
    }).where(eq(discountApplications.id, parseInt(id))).returning();

    // If approved, add a discount fee credit entry for the student
    if (data.status === "approved") {
      const [app] = await db.select().from(discountApplications).where(eq(discountApplications.id, parseInt(id)));
      const [dtype] = await db.select().from(discountTypes).where(eq(discountTypes.id, app.discountTypeId));
      // Find the latest unpaid tuition fee for this student
      const studentFees = await db.select().from(fees)
        .where(eq(fees.studentId, app.studentId));
      const tuitionFee = studentFees.find(f => f.feeType === "monthly" && !f.paid);
      if (tuitionFee && dtype) {
        const discountAmt = Math.round((tuitionFee.amount * dtype.percentage) / 100);
        // Record as a note on the fee
        await db.update(fees).set({
          notes: `${dtype.percentage}% ${dtype.name} discount applied (-₹${discountAmt}). Payable: ₹${tuitionFee.amount - discountAmt}`,
          amount: tuitionFee.amount - discountAmt,
        }).where(eq(fees.id, tuitionFee.id));
      }
    }
    return res.json(row);
  }
  return res.status(405).json({ error: "Method not allowed" });
}

// ── Password Reset ─────────────────────────────────────────────────────────────
export async function handlePasswordReset(req: VercelRequest, res: VercelResponse, sub: string[]) {
  const action = sub[0];

  // POST /api/password-reset/request — send reset email
  if (action === "request" && req.method === "POST") {
    const { username } = z.object({ username: z.string().min(1) }).parse(req.body);
    const [user] = await db.select().from(users).where(eq(users.username, username));
    // Always return success to avoid username enumeration
    if (!user) return res.json({ ok: true });
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await db.insert(passwordResets).values({ username, token, expiresAt });
    const resetUrl = `${process.env.FRONTEND_URL || "https://pircricketacademy.co.in"}/admin?reset=${token}`;
    const adminEmail = ADMIN_EMAIL;
    await sendEmail(
      adminEmail,
      "PIRcricketHub — Admin Password Reset",
      `<p>Hi ${user.name},</p><p>Click the link below to reset your admin password. This link expires in 1 hour.</p><p><a href="${resetUrl}" style="background:#eab308;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Reset Password</a></p><p>If you did not request this, ignore this email.</p>`,
    );
    return res.json({ ok: true });
  }

  // POST /api/password-reset/confirm — set new password using token
  if (action === "confirm" && req.method === "POST") {
    const { token, password } = z.object({
      token: z.string().min(1),
      password: z.string().min(8),
    }).parse(req.body);
    const [reset] = await db.select().from(passwordResets).where(eq(passwordResets.token, token));
    if (!reset) return res.status(400).json({ error: "Invalid or expired reset link" });
    if (reset.usedAt) return res.status(400).json({ error: "Reset link already used" });
    if (new Date() > reset.expiresAt) return res.status(400).json({ error: "Reset link has expired" });
    const passwordHash = await bcrypt.hash(password, 10);
    await db.update(users).set({ passwordHash }).where(eq(users.username, reset.username));
    await db.update(passwordResets).set({ usedAt: new Date() }).where(eq(passwordResets.token, token));
    return res.json({ ok: true });
  }

  return res.status(404).json({ error: "Not found" });
}

// Named exports for use by router.ts
// ── Debug email — admin only, temporary ────────────────────────────────────────
export async function handleDebugEmail(req: VercelRequest, res: VercelResponse) {
  try { requireAdmin(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "PIRcricketHub <onboarding@resend.dev>";
  const adminEmail = ADMIN_EMAIL;
  const keyHint = apiKey ? `${apiKey.slice(0, 7)}...${apiKey.slice(-4)} (len=${apiKey.length})` : "NOT SET";

  if (!apiKey) {
    return res.json({ ok: false, error: "RESEND_API_KEY is not set", keyHint, fromEmail, adminEmail });
  }

  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: fromEmail,
      to: adminEmail,
      subject: "✅ PIR Email Debug Test",
      html: `<p>Debug test email sent at ${new Date().toISOString()}. If you see this, Resend is working.</p><p>From: ${fromEmail}<br>To: ${adminEmail}<br>Key hint: ${keyHint}</p>`,
    }),
  });
  const body = await resendRes.json().catch(() => ({}));
  return res.json({
    ok: resendRes.ok,
    status: resendRes.status,
    resendResponse: body,
    keyHint,
    fromEmail,
    adminEmail,
  });
}

// ── Blocked Slots ─────────────────────────────────────────────────────────────
export async function handleBlockedSlots(req: VercelRequest, res: VercelResponse) {
  const id = (req as any)._sub?.[0] ? parseInt((req as any)._sub[0]) : null;

  // Public GET — booking page reads this to filter slots
  if (req.method === "GET") {
    const { date, facility } = req.query as Record<string, string>;
    let rows = await db.select().from(blockedSlots).orderBy(blockedSlots.date);
    if (date) rows = rows.filter(r => r.date === date || r.date === "*");
    if (facility) rows = rows.filter(r => r.facility === facility || r.facility === "all");
    return res.json(rows);
  }

  // Admin-only mutations
  try { requireAdmin(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }

  if (req.method === "POST") {
    const data = z.object({
      date: z.string().min(1),
      facility: z.string().min(1),
      slot: z.string().optional().nullable(),
      reason: z.string().min(1),
    }).parse(req.body);
    const [row] = await db.insert(blockedSlots).values({ ...data, createdBy: "admin" }).returning();
    return res.status(201).json(row);
  }

  if (req.method === "DELETE" && id) {
    await db.delete(blockedSlots).where(eq(blockedSlots.id, id));
    return res.json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

// ── Default seeding helpers ────────────────────────────────────────────────────
const DEFAULT_FACILITY_RATES = [
  { facilityId:"box",     name:"Box Cricket Arena",             emoji:"🏟️", unit:"hr",    weekdayRate:1500, weekendRate:1800, nightRate:2200 },
  { facilityId:"turf",    name:"Turf Wicket",                   emoji:"🏏", unit:"hr",    weekdayRate:800,  weekendRate:1000, nightRate:null },
  { facilityId:"cement",  name:"Astro Turf / Cemented Wicket",  emoji:"⚡", unit:"hr",    weekdayRate:500,  weekendRate:700,  nightRate:null },
  { facilityId:"bowling", name:"Cricket Bowling Machine",       emoji:"⚙️", unit:"30min", weekdayRate:300,  weekendRate:400,  nightRate:null },
];
const DEFAULT_FEE_CONFIG = [
  { key:"registration_fee", label:"Registration Fee",   value:5000 },
  { key:"monthly_fee",      label:"Monthly Fee",        value:3500 },
  { key:"kit_fee",          label:"Kit Fee",            value:2000 },
];

async function seedFacilityRates() {
  const existing = await db.select().from(facilityRates);
  if (existing.length > 0) return;
  await db.insert(facilityRates).values(DEFAULT_FACILITY_RATES);
}
async function seedFeeConfig() {
  const existing = await db.select().from(feeConfig);
  if (existing.length > 0) return;
  await db.insert(feeConfig).values(DEFAULT_FEE_CONFIG);
}

// ── GET /api/facility-rates  — public, used by booking page
// ── PATCH /api/facility-rates/:id  — admin only
// ── GET /api/fee-config  — admin only
// ── PATCH /api/fee-config/:key  — admin only
async function handleFacilityRates(req: VercelRequest, res: VercelResponse, sub: string[]) {
  await seedFacilityRates();
  if (req.method === "GET") {
    const all = await db.select().from(facilityRates).orderBy(facilityRates.id);
    return res.json(all);
  }
  // All writes require admin
  try { requireAdmin(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
  const id = sub[0] ? parseInt(sub[0]) : null;
  if (req.method === "PATCH" && id) {
    const data = z.object({
      name: z.string().min(1).optional(),
      emoji: z.string().optional(),
      weekdayRate: z.number().int().positive().optional(),
      weekendRate: z.number().int().positive().optional(),
      nightRate: z.number().int().positive().nullable().optional(),
      isActive: z.boolean().optional(),
    }).parse(req.body);
    const [row] = await db.update(facilityRates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(facilityRates.id, id))
      .returning();
    return res.json(row);
  }
  return res.status(405).json({ error: "Method not allowed" });
}

async function handleFeeConfig(req: VercelRequest, res: VercelResponse, sub: string[]) {
  await seedFeeConfig();
  try { requireAdmin(req); } catch (e: any) { return res.status(e.status || 401).json({ error: e.message }); }
  if (req.method === "GET") {
    const all = await db.select().from(feeConfig).orderBy(feeConfig.id);
    return res.json(all);
  }
  const key = sub[0];
  if (req.method === "PATCH" && key) {
    const { value } = z.object({ value: z.number().int().min(0) }).parse(req.body);
    const [row] = await db.update(feeConfig)
      .set({ value, updatedAt: new Date() })
      .where(eq(feeConfig.key, key))
      .returning();
    return res.json(row);
  }
  return res.status(405).json({ error: "Method not allowed" });
}

export {
  handleAuth, handleInquiries, handleFollowUps, handleAdmissions,
  handleBookings, handleBatches, handleStudents, handleAttendance,
  handleSessionNotes, handlePlayerRatings, handleFees, handleNotifications,
  handleParent, handleStudentPortal, handleTemplates, handleCampaigns, handleEvents, handleUsers,
  handleFacilityRates, handleFeeConfig,
};
