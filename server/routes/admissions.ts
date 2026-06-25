import { Router } from "express";
import { db } from "../db/index.js";
import { admissions } from "../db/schema.js";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// Public: submit admission / trial application
router.post("/", async (req, res) => {
  const d = req.body ?? {};
  const required = ["studentName","dob","ageGroup","parentName","phone","emergencyName","emergencyPhone"];
  for (const k of required) {
    if (!d[k]) return res.status(400).json({ error: `${k} is required` });
  }
  try {
    const [row] = await db.insert(admissions).values({
      studentName:   d.studentName,
      dob:           d.dob,
      ageGroup:      d.ageGroup,
      school:        d.school        ?? null,
      parentName:    d.parentName,
      phone:         d.phone,
      email:         d.email         ?? null,
      address:       d.address       ?? null,
      bloodGroup:    d.bloodGroup    ?? null,
      allergies:     d.allergies     ?? null,
      asthma:        Boolean(d.asthma),
      medicalNotes:  d.medicalNotes  ?? null,
      emergencyName: d.emergencyName,
      emergencyPhone:d.emergencyPhone,
      isTrial:       Boolean(d.isTrial),
      trialDate:     d.trialDate     ?? null,
      message:       d.message       ?? null,
      source:        d.source        ?? null,
    }).returning();
    res.json({ success: true, id: row.id });
  } catch (err) {
    console.error("[admissions/post]", err);
    res.status(500).json({ error: "Failed to save application" });
  }
});

// Admin: list all
router.get("/", requireAdmin, async (_req, res) => {
  const all = await db.select().from(admissions).orderBy(desc(admissions.createdAt));
  res.json(all);
});

// Admin: update status
router.patch("/:id/status", requireAdmin, async (req, res) => {
  const { status } = req.body ?? {};
  const valid = ["new","trial_scheduled","joined","rejected"];
  if (!valid.includes(status)) return res.status(400).json({ error: "Invalid status" });
  await db.update(admissions).set({ status }).where(eq(admissions.id, parseInt(req.params.id)));
  res.json({ success: true });
});

export default router;
