import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRouter      from "./routes/auth.js";
import inquiriesRouter from "./routes/inquiries.js";
import admissionsRouter from "./routes/admissions.js";
import bookingsRouter  from "./routes/bookings.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === "production";

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: isProd ? false : (process.env.CORS_ORIGIN || "http://localhost:5173"),
  credentials: true,
}));
app.use(express.json());

// ── API Routes ──────────────────────────────────────────────────────────────
app.use("/api/auth",       authRouter);
app.use("/api/inquiries",  inquiriesRouter);
app.use("/api/admissions", admissionsRouter);
app.use("/api/bookings",   bookingsRouter);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString(), env: process.env.NODE_ENV });
});

// ── Serve React build in production ─────────────────────────────────────────
if (isProd) {
  const distPath = path.join(__dirname, "../dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
}

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ PIR Academy server running on http://localhost:${PORT}`);
  console.log(`   Mode: ${isProd ? "production" : "development"}`);
});
