// routes/reportRoutes.js
import express from "express";
import {
  getDashboardSummary, getFeedingReport, getBreedingReport,
  getInventoryReport, getSalesReport,
  getPlatformSummary, getOrganizationsBreakdown,
} from "../controllers/reportController.js";
import { authenticate, authorize, requireTenantUser, requireSuperAdmin } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

// ---- Farm-level reports (Admin/Staff, scoped to their own organization) ----
router.get("/dashboard", requireTenantUser, getDashboardSummary);
router.get("/feeding", requireTenantUser, authorize("admin"), getFeedingReport);
router.get("/breeding", requireTenantUser, authorize("admin"), getBreedingReport);
router.get("/inventory", requireTenantUser, authorize("admin"), getInventoryReport);
router.get("/sales", requireTenantUser, authorize("admin"), getSalesReport);

// ---- Platform-level reports (super_admin only, aggregate across all farms) ----
router.get("/platform/summary", requireSuperAdmin, getPlatformSummary);
router.get("/platform/organizations", requireSuperAdmin, getOrganizationsBreakdown);

export default router;
