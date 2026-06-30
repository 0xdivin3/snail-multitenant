// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import penRoutes from "./routes/penRoutes.js";
import breedingRoutes from "./routes/breedingRoutes.js";
import feedingRoutes from "./routes/feedingRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

// Global error handler (catches anything unhandled)
app.use((err, req, res, next) => {
  console.error("[UNHANDLED ERROR]", err);
  res.status(500).json({ message: "An unexpected error occurred." });
});

const PORT = process.env.PORT || 5000;

// Only listen directly when run locally; Vercel will import the app instead.
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`SNAIL API running on http://localhost:${PORT}`);
  });
}

export default app;
