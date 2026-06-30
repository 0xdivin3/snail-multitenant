// routes/salesRoutes.js
import express from "express";
import {
  getAllSales, getSalesSummary, createSale, updateSale, deleteSale,
} from "../controllers/salesController.js";
import { authenticate, authorize, requireTenantUser } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate, requireTenantUser);

router.get("/", getAllSales);
router.get("/summary", getSalesSummary);
router.post("/", authorize("admin", "staff"), createSale);
router.put("/:id", authorize("admin"), updateSale);
router.delete("/:id", authorize("admin"), deleteSale);

export default router;
