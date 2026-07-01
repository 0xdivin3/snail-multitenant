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

// Must be first — handle CORS before anything else
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, mobile apps)
    if (!origin) return callback(null, true);
    // Allow localhost in dev
    if (origin.startsWith("http://localhost")) return callback(null, true);
    // Allow any vercel.app subdomain
    if (origin.endsWith(".vercel.app")) return callback(null, true);
    // Allow explicit CLIENT_URL if set
    if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200, // Some browsers (IE11) choke on 204
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Respond 200 to all preflight OPTIONS

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

// Global error handler
app.use((err, req, res, next) => {
  console.error("[UNHANDLED ERROR]", err);
  res.status(500).json({ message: "An unexpected error occurred." });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`SNAIL API running on http://localhost:${PORT}`);
  });
}

export default app;
