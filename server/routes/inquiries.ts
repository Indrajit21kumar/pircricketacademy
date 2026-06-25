import { Router } from "express";
import { db } from "../db/index.js";
import { inquiries } from "../db/schema.js";
import { desc, eq } from "drizzle-orm";
import { requireAdmin, AuthRequest } from "../middleware/auth.js";

const router = Router();

// Public: submit interest form
router.post("/", async (req, res) => {
  const d = req.body ?? {};
  if (!d.name || !d.phone || !d.childName || !d.ageGroup) {
    return res.status(400).json({ error: "name, phone, childName, ageGroup are required" });
  }
  try {
    const [row] = await db.insert(inquiries).values({
      name: d.name,
      phone: d.phone,
      email: d.email ?? null,
      childName: d.childName,
      ageGroup: d.ageGroup,
      source: d.source ?? null,
      message: d.message ?? null,
    }).returning();
    res.json({ success: true, id: row.id });
  } catch (err) {
    console.error("[inquiries/post]", err);
    res.status(500).json({ error: "Failed to save inquiry" });
  }
});

// Admin: list all
router.get("/", requireAdmin, async (_req, res) => {
  const all = await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
  res.json(all);
});

// Admin: update status
router.patch("/:id/status", requireAdmin, async (req, res) => {
  const { status } = req.body ?? {};
  if (!["new","contacted","converted"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  await db.update(inquiries).set({ status }).where(eq(inquiries.id, parseInt(req.params.id)));
  res.json({ success: true });
});

export default router;
