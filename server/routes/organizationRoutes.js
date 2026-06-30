// routes/organizationRoutes.js
import express from "express";
import {
  getAllOrganizations, getOrganizationById,
  updateOrganizationStatus, getOrganizationUsers,
} from "../controllers/organizationController.js";
import { authenticate, requireSuperAdmin } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate, requireSuperAdmin); // every route here is super_admin only

router.get("/", getAllOrganizations);
router.get("/:id", getOrganizationById);
router.get("/:id/users", getOrganizationUsers);
router.patch("/:id/status", updateOrganizationStatus);

export default router;
