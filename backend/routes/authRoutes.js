// routes/authRoutes.js
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
	register,
	login,
	getMe,
	logout,
	refreshToken,
} from "../controllers/authController.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", authMiddleware, getMe);
router.post("/logout", authMiddleware, logout);
router.post("/refresh", authMiddleware, refreshToken);

export default router;
