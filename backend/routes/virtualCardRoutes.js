import express from "express";
import { createVirtualCard, getVirtualCards } from "../controllers/virtualCardController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createVirtualCard);
router.get("/", authMiddleware, getVirtualCards);

export default router;
