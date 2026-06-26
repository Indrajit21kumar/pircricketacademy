import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./_db";
import { users } from "../server/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "pir-cricket-secret-2024";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { username, password } = req.body as { username: string; password: string };
  if (!username || !password) return res.status(400).json({ error: "Username and password required" });

  try {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({ token, user: { id: user.id, username: user.username, role: user.role, name: user.name } });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
