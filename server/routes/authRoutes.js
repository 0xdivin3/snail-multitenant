// routes/authRoutes.js
import express from "express";
import { signup, register, login, getMe } from "../controllers/authController.js";
import { authenticate, authorize, requireTenantUser } from "../middleware/auth.js";

const router = express.Router();

// PUBLIC — a new farm business registers itself + its first Admin
router.post("/signup", signup);

router.post("/login", login);

// Only a logged-in farm Admin can create more Staff/Admin accounts, scoped to their own org
router.post("/register", authenticate, requireTenantUser, authorize("admin"), register);

router.get("/me", authenticate, getMe);

export default router;
