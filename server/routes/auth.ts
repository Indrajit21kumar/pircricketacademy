import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }
  try {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.name },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, name: user.name } });
  } catch (err) {
    console.error("[auth/login]", err);
    res.status(500).json({ error: "Server error" });
  }
});

// One-time admin seed — blocked in production after first use
router.post("/setup", async (req, res) => {
  try {
    const existing = await db.select().from(users).where(eq(users.role, "admin"));
    if (existing.length > 0) {
      return res.status(409).json({ error: "Admin already configured" });
    }
    const { password } = req.body ?? {};
    if (!password || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    const hash = await bcrypt.hash(password, 12);
    await db.insert(users).values({
      username: "admin",
      passwordHash: hash,
      role: "admin",
      name: "Indrajit Kumar",
    });
    res.json({ message: "Admin account created. You can now log in." });
  } catch (err) {
    console.error("[auth/setup]", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
