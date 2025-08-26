import prisma from "../prisma/prismaClient.js";

export const addExpense = async (req, res) => {
	try {
		const { description, amount, category } = req.body;
		const userId = req.user.id; // comes from JWT middleware

		// First, check if any categories exist
		const allCategories = await prisma.category.findMany();

		// If no categories exist, create them
		if (allCategories.length === 0) {
			const defaultCategories = [
				"Food",
				"Transport",
				"Shopping",
				"Entertainment",
				"Bills",
				"Healthcare",
				"Education",
				"Other",
			];

			for (const categoryName of defaultCategories) {
				await prisma.category.create({
					data: { name: categoryName },
				});
			}
			console.log("Default categories created");
		}

		// Now find the category by name
		const categoryRecord = await prisma.category.findUnique({
			where: { name: category },
		});

		if (!categoryRecord) {
			return res
				.status(400)
				.json({ error: `Category '${category}' not found` });
		}

		const expense = await prisma.expense.create({
			data: {
				description,
				amount: parseFloat(amount),
				categoryId: categoryRecord.id,
				userId,
			},
			include: {
				category: true,
			},
		});

		res.json(expense);
	} catch (error) {
		console.error("Add expense error:", error);
		res.status(500).json({ error: "Error adding expense: " + error.message });
	}
};

export const getExpenses = async (req, res) => {
	try {
		const userId = req.user.id;

		const expenses = await prisma.expense.findMany({
			where: { userId },
			include: {
				category: true,
			},
			orderBy: { date: "desc" },
		});

		res.json(expenses);
	} catch (error) {
		console.error("Get expenses error:", error);
		res
			.status(500)
			.json({ error: "Error fetching expenses: " + error.message });
	}
};
