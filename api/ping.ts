import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json({
    ok: true,
    time: new Date().toISOString(),
    method: req.method,
    url: req.url,
    query: req.query,
    hasDb: !!process.env.DATABASE_URL,
  });
}
