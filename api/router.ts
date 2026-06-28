import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  handleAuth, handleInquiries, handleFollowUps, handleAdmissions,
  handleBookings, handleBatches, handleStudents, handleAttendance,
  handleSessionNotes, handlePlayerRatings, handleFees, handleNotifications,
  handleParent, handleStudentPortal, handleTemplates, handleCampaigns, handleEvents, handleUsers,
  handleDiscountTypes, handleDiscountApplications, handlePasswordReset,
} from "./_handlers.js";

// ── Simple in-memory rate limiter (per IP, resets every minute) ──────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function rateLimit(ip: string, resource: string, limit: number): boolean {
  const key = `${ip}:${resource}`;
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  entry.count++;
  if (entry.count > limit) return false;
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = process.env.FRONTEND_URL || "https://pircricketacademy.vercel.app";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  // Security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const pParam = Array.isArray(req.query._p) ? req.query._p[0] : (req.query._p ?? "");
    const segments = pParam
      ? pParam.split("/").filter(Boolean)
      : (req.url || "").split("?")[0].replace(/^\/api\/?/, "").split("/").filter(Boolean);
    const [resource, ...sub] = segments;

    const ip = (req.headers["x-forwarded-for"] as string || "unknown").split(",")[0].trim();

    // Rate limit public-facing write endpoints
    const writeResources = ["admissions", "bookings", "inquiries", "auth"];
    if (writeResources.includes(resource) && req.method === "POST") {
      if (!rateLimit(ip, resource, 20)) {
        return res.status(429).json({ error: "Too many requests. Please wait a minute and try again." });
      }
    }

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
      case "student-portal": return handleStudentPortal(req, res);
      case "templates":      return handleTemplates(req, res);
      case "campaigns":      return handleCampaigns(req, res);
      case "events":         return handleEvents(req, res);
      case "users":                   return handleUsers(req, res);
      case "discount-types":          return handleDiscountTypes(req, res);
      case "discount-applications":   return handleDiscountApplications(req, res);
      case "password-reset":          return handlePasswordReset(req, res, sub);
      default:               return res.status(404).json({ error: `Unknown resource: ${resource}` });
    }
  } catch (e: any) {
    const isProd = process.env.NODE_ENV === "production";
    return res.status(500).json({ error: e.message, ...(isProd ? {} : { stack: (e.stack || "").split("\n").slice(0, 4).join(" | ") }) });
  }
}
