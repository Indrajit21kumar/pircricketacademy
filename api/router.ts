import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  handleAuth, handleInquiries, handleFollowUps, handleAdmissions,
  handleBookings, handleBatches, handleStudents, handleAttendance,
  handleSessionNotes, handlePlayerRatings, handleFees, handleNotifications,
  handleParent, handleTemplates, handleCampaigns, handleEvents,
} from "./_handlers";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const pParam = Array.isArray(req.query._p) ? req.query._p[0] : (req.query._p ?? "");
    const segments = pParam
      ? pParam.split("/").filter(Boolean)
      : (req.url || "").split("?")[0].replace(/^\/api\/?/, "").split("/").filter(Boolean);
    const [resource, ...sub] = segments;

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
    return res.status(500).json({ error: e.message, stack: (e.stack || "").split("\n").slice(0, 4).join(" | ") });
  }
}
