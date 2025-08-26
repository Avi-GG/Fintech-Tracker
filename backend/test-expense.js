import prisma from "./prisma/prismaClient.js";
import { config } from "dotenv";

config();

async function testExpenseCreation() {
	try {
		console.log("🔧 Testing expense creation...");

		// First ensure categories exist
		const categories = [
			"Food",
			"Transport",
			"Shopping",
			"Entertainment",
			"Bills",
			"Healthcare",
			"Education",
			"Other",
		];

		for (const categoryName of categories) {
			await prisma.category.upsert({
				where: { name: categoryName },
				update: {},
				create: { name: categoryName },
			});
		}

		console.log("✅ Categories created/updated");

		// Find Food category
		const foodCategory = await prisma.category.findUnique({
			where: { name: "Food" },
		});

		console.log("🍔 Food category:", foodCategory);

		// Try to create an expense
		const testExpense = await prisma.expense.create({
			data: {
				amount: 25.5,
				description: "Test lunch expense",
				categoryId: foodCategory.id,
				userId: "97660bca-ab48-48e2-9b35-9560945eb743",
			},
			include: {
				category: true,
				user: true,
			},
		});

		console.log("✅ Expense created:", testExpense);

		await prisma.$disconnect();
	} catch (error) {
		console.error("❌ Error:", error);
		await prisma.$disconnect();
		process.exit(1);
	}
}

testExpenseCreation();
