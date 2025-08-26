import prisma from "../prisma/prismaClient.js";
import logger from "../config/logger.js";

// Search users for transfer
export const searchUsers = async (req, res) => {
	const { q } = req.query; // search query
	const currentUserId = req.user.id;

	try {
		let whereClause = {
			id: { not: currentUserId }, // Exclude current user
		};

		// If query provided, add search conditions
		if (q && q.length >= 1) {
			whereClause.OR = [
				{ email: { contains: q, mode: "insensitive" } },
				{ name: { contains: q, mode: "insensitive" } },
			];
		}

		const users = await prisma.user.findMany({
			where: whereClause,
			select: {
				id: true,
				email: true,
				name: true,
				Wallet: {
					select: {
						id: true, // Just to verify they have a wallet
					},
				},
			},
			take: 10, // Limit results
		});

		// Filter out users without wallets
		const usersWithWallets = users.filter((user) => user.Wallet);

		res.json(
			usersWithWallets.map((user) => ({
				id: user.id,
				email: user.email,
				name: user.name,
				displayName: user.name || user.email,
			}))
		);
	} catch (err) {
		console.error("User search error:", err);
		res.status(500).json({ error: "Failed to search users" });
	}
};

export const transfer = async (req, res) => {
	const { to, amount, note } = req.body;
	const fromUserId = req.user.id;

	console.log("Transfer request details:", {
		fromUserId,
		to,
		amount,
		note,
		userObject: req.user,
	});

	// Validation
	if (!to || !amount) {
		return res
			.status(400)
			.json({ error: "Recipient identifier and amount are required" });
	}

	if (fromUserId === to) {
		return res.status(400).json({ error: "You cannot send money to yourself" });
	}

	if (amount <= 0) {
		return res.status(400).json({ error: "Amount must be greater than 0" });
	}

	try {
		// Find recipient by email, name, or ID
		let recipientUser = null;

		console.log("Looking for recipient:", to);

		// First, try to find by email
		if (to.includes("@")) {
			recipientUser = await prisma.user.findUnique({
				where: { email: to.toLowerCase() },
				include: { Wallet: true },
			});
		} else {
			// Try to find by name or ID
			recipientUser = await prisma.user.findFirst({
				where: {
					OR: [{ id: to }, { name: { contains: to, mode: "insensitive" } }],
				},
				include: { Wallet: true },
			});
		}

		console.log(
			"Found recipient:",
			recipientUser
				? {
						id: recipientUser.id,
						email: recipientUser.email,
						hasWallet: !!recipientUser.Wallet,
				  }
				: null
		);

		if (!recipientUser) {
			return res.status(404).json({
				error:
					"Recipient not found. Try using their email address or exact username.",
			});
		}

		const fromWallet = await prisma.wallet.findUnique({
			where: { userId: fromUserId },
		});

		console.log("From wallet:", fromWallet);

		if (!fromWallet) {
			return res.status(404).json({ error: "Your wallet not found" });
		}

		if (!recipientUser.Wallet) {
			return res.status(404).json({ error: "Recipient wallet not found" });
		}

		console.log("Balance check:", {
			required: amount,
			available: fromWallet.fiatBalance,
			sufficient: fromWallet.fiatBalance >= amount,
		});

		if (fromWallet.fiatBalance < amount) {
			return res.status(400).json({
				error: "Insufficient balance",
				available: fromWallet.fiatBalance,
				required: amount,
			});
		}

		console.log("Performing transfer...", {
			from: fromWallet.fiatBalance,
			to: recipientUser.Wallet.fiatBalance,
			amount,
		});

		// Perform the transfer in a transaction to ensure atomicity
		const result = await prisma.$transaction([
			prisma.wallet.update({
				where: { id: fromWallet.id },
				data: { fiatBalance: { decrement: parseFloat(amount) } },
			}),
			prisma.wallet.update({
				where: { id: recipientUser.Wallet.id },
				data: { fiatBalance: { increment: parseFloat(amount) } },
			}),
			// Create transaction record for sender
			prisma.transaction.create({
				data: {
					amount: parseFloat(amount),
					note:
						note || `Transfer to ${recipientUser.name || recipientUser.email}`,
					type: "EXPENSE",
					category: "P2P",
					status: "COMPLETED",
					userId: fromUserId,
					senderId: fromUserId,
					receiverId: recipientUser.id,
					walletId: fromWallet.id,
				},
			}),
			// Create transaction record for receiver
			prisma.transaction.create({
				data: {
					amount: parseFloat(amount),
					note: note || `Received from ${req.user.name || req.user.email}`,
					type: "INCOME",
					category: "P2P",
					status: "COMPLETED",
					userId: recipientUser.id,
					senderId: fromUserId,
					receiverId: recipientUser.id,
					walletId: recipientUser.Wallet.id,
				},
			}),
		]);

		console.log("Transfer completed successfully");

		// Emit real-time updates via Socket.IO
		if (req.io) {
			console.log("Emitting Socket.IO events...");

			// Fetch complete transaction records with user details for real-time updates
			const senderTransactionWithUsers = await prisma.transaction.findUnique({
				where: { id: result[2].id },
				include: {
					sender: { select: { id: true, email: true, name: true } },
					receiver: { select: { id: true, email: true, name: true } },
				},
			});

			const receiverTransactionWithUsers = await prisma.transaction.findUnique({
				where: { id: result[3].id },
				include: {
					sender: { select: { id: true, email: true, name: true } },
					receiver: { select: { id: true, email: true, name: true } },
				},
			});

			// Emit to sender - wallet update and new transaction
			req.io.to(`user_${fromUserId}`).emit("walletUpdate", {
				userId: fromUserId,
				balance: result[0].fiatBalance,
				btcBalance: result[0].btcBalance,
				transaction: senderTransactionWithUsers,
			});
			req.io.to(`user_${fromUserId}`).emit("transactionUpdate", {
				userId: fromUserId,
				transaction: senderTransactionWithUsers,
			});

			// Emit to receiver - wallet update and new transaction
			req.io.to(`user_${recipientUser.id}`).emit("walletUpdate", {
				userId: recipientUser.id,
				balance: result[1].fiatBalance,
				btcBalance: result[1].btcBalance,
				transaction: receiverTransactionWithUsers,
			});
			req.io.to(`user_${recipientUser.id}`).emit("transactionUpdate", {
				userId: recipientUser.id,
				transaction: receiverTransactionWithUsers,
			});

			console.log(
				`Emitted updates with user details to user_${fromUserId} and user_${recipientUser.id}`
			);
		}

		res.json({
			success: true,
			transaction: result[2], // Return sender's transaction record
			message: `Successfully transferred ₹${amount} to User ${to}`,
		});
	} catch (err) {
		console.error("Transfer error details:", err);
		logger.error("Transfer error:", err);

		// Return more specific error messages
		if (err.message.includes("Insufficient balance")) {
			return res.status(400).json({
				error: err.message,
				type: "insufficient_balance",
			});
		} else if (err.message.includes("not found")) {
			return res.status(404).json({
				error: err.message,
				type: "not_found",
			});
		} else {
			return res.status(500).json({
				error: "Transfer failed: " + err.message,
				type: "server_error",
			});
		}
	}
};

// Get transactions with pagination (infinite scroll)
export const getTransactions = async (req, res) => {
	try {
		const userId = req.user.id;
		const {
			cursor,
			limit = 20,
			type,
			transactionType,
			category,
			from,
			to,
		} = req.query;

		console.log("Getting transactions for user:", userId);

		// Only show transactions where the current user is the primary owner
		let filters = {
			userId: userId, // Only current user's transactions
		};

		if (type) filters.type = type;
		if (transactionType) filters.transactionType = transactionType;
		if (category) filters.category = category;
		if (from || to) {
			filters.createdAt = {};
			if (from) filters.createdAt.gte = new Date(from);
			if (to) filters.createdAt.lte = new Date(to);
		}

		const transactions = await prisma.transaction.findMany({
			where: filters,
			include: {
				sender: {
					select: {
						id: true,
						email: true,
						name: true,
					},
				},
				receiver: {
					select: {
						id: true,
						email: true,
						name: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
			take: Number(limit),
			...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
		});

		console.log(`Found ${transactions.length} transactions`);

		const nextCursor =
			transactions.length === Number(limit) && transactions.length > 0
				? transactions[transactions.length - 1].id
				: null;

		res.json({
			transactions,
			nextCursor,
			hasMore: Boolean(nextCursor),
			total: transactions.length,
		});
	} catch (err) {
		console.error("getTransactions error:", err);
		logger.error("getTransactions error:", err);
		res.status(500).json({ error: err.message });
	}
};
