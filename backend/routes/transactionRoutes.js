import express from "express";
import {
	transfer,
	getTransactions,
	searchUsers,
} from "../controllers/transactionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware); // all routes protected

router.post("/transfer", transfer);
router.get("/", getTransactions);
router.get("/search-users", searchUsers);

export default router;
