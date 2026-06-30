// routes/breedingRoutes.js
import express from "express";
import {
  getAllBreedingRecords, getBreedingRecordById,
  createBreedingRecord, updateBreedingRecord, deleteBreedingRecord,
} from "../controllers/breedingController.js";
import { authenticate, authorize, requireTenantUser } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate, requireTenantUser);

router.get("/", getAllBreedingRecords);
router.get("/:id", getBreedingRecordById);
router.post("/", authorize("admin", "staff"), createBreedingRecord);
router.put("/:id", authorize("admin", "staff"), updateBreedingRecord);
router.delete("/:id", authorize("admin"), deleteBreedingRecord);

export default router;
