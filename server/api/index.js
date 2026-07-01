// api/index.js — Vercel serverless entry point
import app from "../server.js";

export default function handler(req, res) {
  // Inject CORS headers on every single request at the edge,
  // before Express middleware even runs — this is the guaranteed fix for Vercel.
  const origin = req.headers.origin || "";
  const allowed =
    !origin ||
    origin.startsWith("http://localhost") ||
    origin.endsWith(".vercel.app") ||
    origin === (process.env.CLIENT_URL || "");

  if (allowed) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Respond immediately to preflight OPTIONS — don't pass to Express
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // All other requests go to Express
  return app(req, res);
}
