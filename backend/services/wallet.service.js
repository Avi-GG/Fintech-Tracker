import prisma from "../prismaClient.js";

export const transfer = async (fromUserId, toUserId, amount) => {
	if (fromUserId === toUserId) {
		throw new Error("Cannot transfer to yourself");
	}

	return await prisma.$transaction(async (tx) => {
		// 1. Get sender wallet
		const senderWallet = await tx.wallet.findUnique({
			where: { userId: fromUserId },
		});

		if (!senderWallet || senderWallet.balance < amount) {
			throw new Error("Insufficient balance");
		}

		// 2. Get recipient wallet
		const recipientWallet = await tx.wallet.findUnique({
			where: { userId: toUserId },
		});

		if (!recipientWallet) {
			throw new Error("Recipient wallet not found");
		}

		// 3. Update balances
		await tx.wallet.update({
			where: { userId: fromUserId },
			data: { balance: { decrement: amount } },
		});

		await tx.wallet.update({
			where: { userId: toUserId },
			data: { balance: { increment: amount } },
		});

		// 4. Log transaction
		const transaction = await tx.transaction.create({
			data: {
				type: "TRANSFER",
				amount,
				userId: fromUserId,
				recipientId: toUserId,
			},
		});

		return transaction;
	});
};
