import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
	getWallet,
	deposit,
	withdraw,
	getWalletTransactions,
	transferAmount,
} from "../controllers/walletController.js";

const router = express.Router();

// Get wallet details
router.get("/", authMiddleware, getWallet);

// Deposit money
router.post("/deposit", authMiddleware, deposit);

// Withdraw money
router.post("/withdraw", authMiddleware, withdraw);

// Transfer money to another user
router.post("/transfer", authMiddleware, transferAmount);

router.get("/transactions", authMiddleware, getWalletTransactions);

export default router;
