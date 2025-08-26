// controllers/walletController.js
import prisma from "../prisma/prismaClient.js";

// Get wallet balance
export const getWallet = async (req, res) => {
	try {
		// Ensure wallet exists for user
		let wallet = await prisma.wallet.findUnique({
			where: { userId: req.user.id },
		});

		// Create wallet if doesn't exist
		if (!wallet) {
			wallet = await prisma.wallet.create({
				data: {
					userId: req.user.id,
					fiatBalance: 0.0,
					btcBalance: 0.0,
				},
			});
		}

		res.json(wallet);
	} catch (err) {
		console.error(err);
		res.status(500).json({ msg: "Server error" });
	}
};

// Deposit fiat money
export const deposit = async (req, res) => {
	const { amount, currency = "USD" } = req.body;
	const userId = req.user.id;

	if (!amount || amount <= 0) {
		return res.status(400).json({ error: "Invalid amount" });
	}

	try {
		const result = await prisma.$transaction(async (tx) => {
			// 1. Create transaction record
			const transaction = await tx.transaction.create({
				data: {
					userId: userId,
					type: "INCOME",
					category: "WALLET",
					amount: parseFloat(amount),
					status: "PENDING",
					note: `Fiat deposit - ${currency}`,
				},
			});

			// 2. Update wallet balance
			const wallet = await tx.wallet.upsert({
				where: { userId: userId },
				update: {
					fiatBalance: { increment: parseFloat(amount) },
				},
				create: {
					userId: userId,
					fiatBalance: parseFloat(amount),
					btcBalance: 0.0,
				},
			});

			// 3. Mark transaction as completed
			await tx.transaction.update({
				where: { id: transaction.id },
				data: { status: "COMPLETED" },
			});

			return { transaction, wallet };
		});

		// Emit real-time update
		if (req.io) {
			req.io.to(`user_${userId}`).emit("balanceUpdate", result.wallet);
		}

		res.json({
			message: "Deposit successful",
			transaction: result.transaction,
			wallet: result.wallet,
		});
	} catch (error) {
		console.error("Deposit error:", error);
		res.status(500).json({ error: "Deposit failed" });
	}
};

// Withdraw fiat money
export const withdraw = async (req, res) => {
	const { amount, currency = "USD" } = req.body;
	const userId = req.user.id;

	if (!amount || amount <= 0) {
		return res.status(400).json({ error: "Invalid amount" });
	}

	try {
		const result = await prisma.$transaction(async (tx) => {
			// 1. Check current balance
			const currentWallet = await tx.wallet.findUnique({
				where: { userId: userId },
			});

			if (!currentWallet || currentWallet.fiatBalance < parseFloat(amount)) {
				throw new Error("Insufficient balance");
			}

			// 2. Create transaction record
			const transaction = await tx.transaction.create({
				data: {
					userId: userId,
					type: "EXPENSE",
					category: "WALLET",
					amount: parseFloat(amount),
					status: "PENDING",
					note: `Fiat withdrawal - ${currency}`,
				},
			});

			// 3. Update wallet balance
			const wallet = await tx.wallet.update({
				where: { userId: userId },
				data: {
					fiatBalance: { decrement: parseFloat(amount) },
				},
			});

			// 4. Mark transaction as completed
			await tx.transaction.update({
				where: { id: transaction.id },
				data: { status: "COMPLETED" },
			});

			return { transaction, wallet };
		});

		// Emit real-time update
		if (req.io) {
			req.io.to(`user_${userId}`).emit("balanceUpdate", result.wallet);
		}

		res.json({
			message: "Withdrawal successful",
			transaction: result.transaction,
			wallet: result.wallet,
		});
	} catch (error) {
		console.error("Withdrawal error:", error);
		res.status(500).json({
			error: error.message || "Withdrawal failed",
		});
	}
};

// Transfer money between users (P2P)
export const transferAmount = async (req, res) => {
	try {
		const fromUserId = req.user.id;
		const { toUserId, amount, note, currency = "fiat" } = req.body;

		const amt = parseFloat(amount);

		// Validation
		if (!toUserId)
			return res.status(400).json({ msg: "Missing recipient user ID" });
		if (toUserId === fromUserId)
			return res.status(400).json({ msg: "Cannot transfer to yourself" });
		if (!amt || amt <= 0)
			return res.status(400).json({ msg: "Invalid amount" });

		const result = await prisma.$transaction(async (tx) => {
			// 1. Verify sender has sufficient balance
			const senderWallet = await tx.wallet.findUnique({
				where: { userId: fromUserId },
			});

			const balanceField = currency === "btc" ? "btcBalance" : "fiatBalance";

			if (!senderWallet || senderWallet[balanceField] < amt) {
				throw new Error("Insufficient balance");
			}

			// 2. Verify recipient exists and get/create their wallet
			const recipientUser = await tx.user.findUnique({
				where: { id: toUserId },
			});
			if (!recipientUser) throw new Error("Recipient user not found");

			let recipientWallet = await tx.wallet.findUnique({
				where: { userId: toUserId },
			});

			if (!recipientWallet) {
				recipientWallet = await tx.wallet.create({
					data: {
						userId: toUserId,
						fiatBalance: 0.0,
						btcBalance: 0.0,
					},
				});
			}

			// 3. Update balances
			const senderUpdate =
				currency === "btc"
					? { btcBalance: { decrement: amt } }
					: { fiatBalance: { decrement: amt } };

			const recipientUpdate =
				currency === "btc"
					? { btcBalance: { increment: amt } }
					: { fiatBalance: { increment: amt } };

			await tx.wallet.update({
				where: { userId: fromUserId },
				data: senderUpdate,
			});

			await tx.wallet.update({
				where: { userId: toUserId },
				data: recipientUpdate,
			});

			// 4. Create transaction records
			const senderTxn = await tx.transaction.create({
				data: {
					userId: fromUserId,
					recipientId: toUserId,
					amount: amt,
					type: "EXPENSE",
					transactionType: "P2P",
					category: "transfer_sent",
					note: note || `Sent ${currency.toUpperCase()} to user ${toUserId}`,
					status: "COMPLETED",
				},
			});

			const recipientTxn = await tx.transaction.create({
				data: {
					userId: toUserId,
					senderId: fromUserId,
					amount: amt,
					type: "INCOME",
					transactionType: "P2P",
					category: "transfer_received",
					note:
						note ||
						`Received ${currency.toUpperCase()} from user ${fromUserId}`,
					status: "COMPLETED",
				},
			});

			// 5. Get updated wallet balances
			const [updatedSenderWallet, updatedRecipientWallet] = await Promise.all([
				tx.wallet.findUnique({ where: { userId: fromUserId } }),
				tx.wallet.findUnique({ where: { userId: toUserId } }),
			]);

			return {
				senderTxn,
				recipientTxn,
				senderWallet: updatedSenderWallet,
				recipientWallet: updatedRecipientWallet,
			};
		});

		// Emit real-time updates to both users
		if (req.io) {
			req.io
				.to(`user_${fromUserId}`)
				.emit("balanceUpdate", result.senderWallet);
			req.io
				.to(`user_${toUserId}`)
				.emit("balanceUpdate", result.recipientWallet);

			// Emit transaction notifications
			req.io.to(`user_${toUserId}`).emit("newTransaction", {
				type: "transfer_received",
				amount: amt,
				from: fromUserId,
				transaction: result.recipientTxn,
			});
		}

		res.json({
			message: "Transfer successful",
			senderTransaction: result.senderTxn,
			recipientTransaction: result.recipientTxn,
			senderBalance: result.senderWallet,
			recipientBalance: result.recipientWallet,
		});
	} catch (err) {
		console.error("Transfer error:", err);
		res.status(400).json({ msg: err.message });
	}
};

// Get wallet transactions
export const getWalletTransactions = async (req, res) => {
	try {
		const userId = req.user.id;

		// Query parameters for filtering
		const {
			type,
			transactionType,
			category,
			from,
			to,
			limit = 50,
			offset = 0,
		} = req.query;

		const filters = {
			OR: [{ userId: userId }, { recipientId: userId }, { senderId: userId }],
		};

		if (type) filters.type = type;
		if (transactionType) filters.transactionType = transactionType;
		if (category) filters.category = category;

		if (from || to) {
			filters.createdAt = {};
			if (from) filters.createdAt.gte = new Date(from);
			if (to) filters.createdAt.lte = new Date(to);
		}

		const [transactions, totalCount] = await Promise.all([
			prisma.transaction.findMany({
				where: filters,
				orderBy: { createdAt: "desc" },
				take: parseInt(limit),
				skip: parseInt(offset),
				include: {
					user: {
						select: { id: true, name: true, email: true },
					},
					recipient: {
						select: { id: true, name: true, email: true },
					},
					sender: {
						select: { id: true, name: true, email: true },
					},
				},
			}),
			prisma.transaction.count({ where: filters }),
		]);

		res.json({
			transactions,
			pagination: {
				total: totalCount,
				limit: parseInt(limit),
				offset: parseInt(offset),
				hasMore: parseInt(offset) + parseInt(limit) < totalCount,
			},
		});
	} catch (error) {
		console.error("getWalletTransactions error:", error);
		res.status(500).json({ message: "Error fetching transactions" });
	}
};
