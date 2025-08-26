import express from "express";
import prisma from "../prisma/prismaClient.js";
import fetch from "node-fetch";
import { authMiddleware } from "../middleware/authMiddleware.js";

const conversionRoutes = (io) => {
	const router = express.Router();

	// POST /api/convert?from=USD&to=BTC&amount=100
	router.post("/", authMiddleware, async (req, res) => {
		try {
			console.log("Conversion request received:");
			console.log("Query params:", req.query);
			console.log("User from token:", req.user);

			let { from, to, amount } = req.query;
			// ✅ Fix: Use req.user.id instead of req.user.userId
			const userId = req.user.id;

			console.log(`User ID: ${userId}`);

			amount = Number(amount);
			if (!from || !to || isNaN(amount) || amount <= 0) {
				console.log("Validation failed:", {
					from,
					to,
					amount,
					isNaN: isNaN(amount),
				});
				return res.status(400).json({
					error: "Invalid from, to, or amount",
					debug: { from, to, amount, isNaN: isNaN(amount) },
				});
			}

			// ✅ Add validation for supported currencies
			if (!["USD", "BTC"].includes(from) || !["USD", "BTC"].includes(to)) {
				return res
					.status(400)
					.json({ error: "Only USD and BTC are supported" });
			}

			if (from === to) {
				return res.status(400).json({ error: "Cannot convert same currency" });
			}

			// Check if user exists and has wallet
			console.log(`Looking for wallet for userId: ${userId}`);

			const wallet = await prisma.wallet.findUnique({ where: { userId } });
			if (!wallet) {
				console.log("Wallet not found for user:", userId);
				return res.status(404).json({ error: "Wallet not found" });
			}

			console.log("Current wallet balances:", {
				fiatBalance: wallet.fiatBalance,
				btcBalance: wallet.btcBalance,
			});

			// fetch live price (BTC <-> USD only) with fallback
			console.log("Fetching BTC price from CoinGecko...");
			let btcPrice;

			try {
				const response = await fetch(
					"https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
					{
						headers: {
							"User-Agent": "FinTech-Expense-Tracker/1.0",
						},
					}
				);

				if (!response.ok) {
					throw new Error(`CoinGecko API error: ${response.status}`);
				}

				const data = await response.json();
				btcPrice = data.bitcoin.usd;
				console.log("Current BTC price from CoinGecko:", btcPrice);
			} catch (apiError) {
				console.error("CoinGecko API failed:", apiError.message);

				// Fallback to mock price with warning
				btcPrice = 110000; // Mock price
				console.log("Using fallback BTC price:", btcPrice);

				// Don't return error, continue with fallback
			}

			let convertedAmount;
			if (from === "USD" && to === "BTC") {
				convertedAmount = amount / btcPrice;
			} else if (from === "BTC" && to === "USD") {
				convertedAmount = amount * btcPrice;
			} else {
				console.log("Unsupported conversion pair:", { from, to });
				return res.status(400).json({ error: "Only USD <-> BTC supported" });
			}

			console.log(`Conversion: ${amount} ${from} → ${convertedAmount} ${to}`);

			// Check balances before conversion
			let updatedWallet;
			if (from === "USD" && to === "BTC") {
				if (wallet.fiatBalance < amount) {
					console.log("Insufficient fiat balance:", {
						required: amount,
						available: wallet.fiatBalance,
					});
					return res.status(400).json({
						error: "Insufficient fiat balance",
						required: amount,
						available: wallet.fiatBalance,
					});
				}
				updatedWallet = await prisma.wallet.update({
					where: { userId },
					data: {
						fiatBalance: { decrement: amount },
						btcBalance: { increment: convertedAmount },
					},
				});
			} else {
				if (wallet.btcBalance < amount) {
					console.log("Insufficient BTC balance:", {
						required: amount,
						available: wallet.btcBalance,
					});
					return res.status(400).json({
						error: "Insufficient BTC balance",
						required: amount,
						available: wallet.btcBalance,
					});
				}
				updatedWallet = await prisma.wallet.update({
					where: { userId },
					data: {
						btcBalance: { decrement: amount },
						fiatBalance: { increment: convertedAmount },
					},
				});
			}

			// Create transaction record
			await prisma.transaction.create({
				data: {
					userId,
					amount,
					type: from === "USD" ? "EXPENSE" : "INCOME",
					category: "CRYPTO",
					note: `Converted ${amount} ${from} to ${convertedAmount.toFixed(
						6
					)} ${to}`,
					status: "COMPLETED",
					walletId: wallet.id,
				},
			});

			console.log("Transaction completed successfully");

			// Emit real-time update
			io.to(String(userId)).emit("balanceUpdate", updatedWallet);

			res.json({
				success: true,
				convertedAmount,
				wallet: updatedWallet,
				exchangeRate: btcPrice,
			});
		} catch (err) {
			console.error("Conversion error:", err);
			res.status(500).json({ error: err.message });
		}
	});

	return router;
};

export default conversionRoutes;
