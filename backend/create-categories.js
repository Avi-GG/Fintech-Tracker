import prisma from "./prisma/prismaClient.js";

async function createCategories() {
	try {
		console.log("🔧 Creating expense categories...");

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

		// Delete any existing categories to start fresh
		await prisma.category.deleteMany({});
		console.log("🗑️ Cleared existing categories");

		// Create new categories
		for (const categoryName of categories) {
			const category = await prisma.category.create({
				data: { name: categoryName },
			});
			console.log(`✅ Created category: ${category.name} (ID: ${category.id})`);
		}

		// Verify categories exist
		const allCategories = await prisma.category.findMany();
		console.log("\n📋 All categories in database:");
		allCategories.forEach((cat) => {
			console.log(`   - ${cat.name} (ID: ${cat.id})`);
		});

		console.log("\n🎉 Categories created successfully!");

		await prisma.$disconnect();
		process.exit(0);
	} catch (error) {
		console.error("❌ Error creating categories:", error);
		await prisma.$disconnect();
		process.exit(1);
	}
}

createCategories();
