// api/index.js — Vercel serverless entry point
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "../routes/authRoutes.js";
import penRoutes from "../routes/penRoutes.js";
import breedingRoutes from "../routes/breedingRoutes.js";
import feedingRoutes from "../routes/feedingRoutes.js";
import inventoryRoutes from "../routes/inventoryRoutes.js";
import salesRoutes from "../routes/salesRoutes.js";
import reportRoutes from "../routes/reportRoutes.js";
import organizationRoutes from "../routes/organizationRoutes.js";

dotenv.config();

const app = express();

// CORS — set headers manually before cors() middleware as a safety net
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (
    !origin ||
    origin.startsWith("http://localhost") ||
    origin.endsWith(".vercel.app") ||
    origin === process.env.CLIENT_URL
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "SNAIL API", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/pens", penRoutes);
app.use("/api/breeding", breedingRoutes);
app.use("/api/feeding", feedingRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/organizations", organizationRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((err, req, res, next) => {
  console.error("[ERROR]", err);
  res.status(500).json({ message: "An unexpected error occurred." });
});

export default app;
