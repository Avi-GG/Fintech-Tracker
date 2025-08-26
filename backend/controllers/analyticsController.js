import prisma from "../prisma/prismaClient.js";

// 1. Summary: total expenses, total income, balance
export const getSummary = async (req, res) => {
	try {
		const userId = req.user.id;

		const transactions = await prisma.transaction.findMany({
			where: { userId },
			select: { amount: true, type: true }, // type: "income" or "expense"
		});

		let totalExpense = 0;
		let totalIncome = 0;

		transactions.forEach((t) => {
			if (t.type === "expense") totalExpense += t.amount;
			else if (t.type === "income") totalIncome += t.amount;
		});

		res.json({
			totalExpense,
			totalIncome,
			balance: totalIncome - totalExpense,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error fetching summary" });
	}
};

// 2. Monthly breakdown
export const getMonthly = async (req, res) => {
	try {
		const userId = req.user.id;

		const monthly = await prisma.$queryRaw`
			SELECT DATE_TRUNC('month', "createdAt") as month, 
			       SUM(amount)::float as total
			FROM "Transaction"
			WHERE "userId" = ${userId}
			GROUP BY month
			ORDER BY month ASC
		`;

		res.json(monthly);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error fetching monthly analytics" });
	}
};

// 3. Category breakdown
export const getByCategory = async (req, res) => {
	try {
		const userId = req.user.id;

		const categories = await prisma.transaction.groupBy({
			by: ["category"],
			where: { userId },
			_sum: { amount: true },
		});

		res.json(categories);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error fetching category analytics" });
	}
};
