import express from "express";
import {
	getSummary,
	getMonthly,
	getByCategory,
} from "../controllers/analyticsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected
router.get("/summary", authMiddleware, getSummary);
router.get("/monthly", authMiddleware, getMonthly);
router.get("/category", authMiddleware, getByCategory);

export default router;
