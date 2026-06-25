import { Router } from "express";
import { db } from "../db/index.js";
import { bookings } from "../db/schema.js";
import { and, desc, eq } from "drizzle-orm";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

function makeRef(): string {
  return "PIRG-2026-" + Math.floor(1000 + Math.random() * 9000);
}

// Public: check slot availability
router.get("/check", async (req, res) => {
  const { facility, date, slot } = req.query as Record<string, string>;
  if (!facility || !date || !slot) return res.status(400).json({ error: "facility, date, slot required" });
  const existing = await db.select({ id: bookings.id }).from(bookings).where(
    and(eq(bookings.facility, facility), eq(bookings.date, date), eq(bookings.slot, slot), eq(bookings.status, "confirmed"))
  );
  res.json({ available: existing.length === 0 });
});

// Public: create booking
router.post("/", async (req, res) => {
  const d = req.body ?? {};
  const required = ["facility","facilityName","date","slot","duration","rate","total","name","phone"];
  for (const k of required) {
    if (d[k] === undefined || d[k] === "") return res.status(400).json({ error: `${k} is required` });
  }
  try {
    // Double-booking guard
    const clash = await db.select({ id: bookings.id }).from(bookings).where(
      and(eq(bookings.facility, d.facility), eq(bookings.date, d.date), eq(bookings.slot, d.slot), eq(bookings.status, "confirmed"))
    );
    if (clash.length > 0) {
      return res.status(409).json({ error: "This slot is already booked. Please choose a different time." });
    }
    const ref = makeRef();
    const [row] = await db.insert(bookings).values({
      ref,
      facility:     d.facility,
      facilityName: d.facilityName,
      date:         d.date,
      slot:         d.slot,
      duration:     Number(d.duration),
      rate:         Number(d.rate),
      total:        Number(d.total),
      name:         d.name,
      phone:        d.phone,
      email:        d.email ?? null,
    }).returning();
    res.json({ success: true, ref: row.ref, id: row.id });
  } catch (err) {
    console.error("[bookings/post]", err);
    res.status(500).json({ error: "Failed to save booking" });
  }
});

// Admin: list all
router.get("/", requireAdmin, async (_req, res) => {
  const all = await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  res.json(all);
});

// Admin: update status
router.patch("/:id/status", requireAdmin, async (req, res) => {
  const { status } = req.body ?? {};
  if (!["confirmed","completed","cancelled"].includes(status)) return res.status(400).json({ error: "Invalid status" });
  await db.update(bookings).set({ status }).where(eq(bookings.id, parseInt(req.params.id)));
  res.json({ success: true });
});

export default router;
