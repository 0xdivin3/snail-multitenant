// routes/feedingRoutes.js
import express from "express";
import {
  getAllFeedingRecords, createFeedingRecord, updateFeedingRecord, deleteFeedingRecord,
} from "../controllers/feedingController.js";
import { authenticate, authorize, requireTenantUser } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate, requireTenantUser);

router.get("/", getAllFeedingRecords);
router.post("/", authorize("admin", "staff"), createFeedingRecord);
router.put("/:id", authorize("admin", "staff"), updateFeedingRecord);
router.delete("/:id", authorize("admin"), deleteFeedingRecord);

export default router;
