// config/db.js
// Neon Postgres connection using the serverless driver (works great with Vercel functions)
import { Pool } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.warn("[WARN] DATABASE_URL is not set. Set it in your .env file.");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Simple helper for running queries with consistent error handling
export async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== "production") {
      console.log("[DB] query executed", { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (err) {
    console.error("[DB ERROR]", err.message);
    throw err;
  }
}
