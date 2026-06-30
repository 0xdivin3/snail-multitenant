// routes/inventoryRoutes.js
import express from "express";
import {
  getAllInventory, getLowStockItems, createInventoryItem,
  recordTransaction, getItemTransactions, deleteInventoryItem,
} from "../controllers/inventoryController.js";
import { authenticate, authorize, requireTenantUser } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate, requireTenantUser);

router.get("/", getAllInventory);
router.get("/low-stock", getLowStockItems);
router.post("/", authorize("admin"), createInventoryItem);
router.post("/:id/transactions", authorize("admin", "staff"), recordTransaction);
router.get("/:id/transactions", getItemTransactions);
router.delete("/:id", authorize("admin"), deleteInventoryItem);

export default router;
