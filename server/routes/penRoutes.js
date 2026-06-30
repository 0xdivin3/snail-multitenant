// routes/penRoutes.js
import express from "express";
import { getAllPens, getPenById, createPen, updatePen, deletePen } from "../controllers/penController.js";
import { authenticate, authorize, requireTenantUser } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate, requireTenantUser); // farm-data routes — super_admin excluded

router.get("/", getAllPens);
router.get("/:id", getPenById);
router.post("/", authorize("admin"), createPen);
router.put("/:id", authorize("admin"), updatePen);
router.delete("/:id", authorize("admin"), deletePen);

export default router;
