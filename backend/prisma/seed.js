import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
	// Hash passwords
	const hashedPassword = await bcrypt.hash("password123", 10);

	console.log("Creating demo users...");

	// Create users
	const user1 = await prisma.user.upsert({
		where: { email: "alice@demo.com" },
		update: {},
		create: {
			email: "alice@demo.com",
			name: "Alice Johnson",
			password: hashedPassword,
		},
	});

	const user2 = await prisma.user.upsert({
		where: { email: "bob@demo.com" },
		update: {},
		create: {
			email: "bob@demo.com",
			name: "Bob Smith",
			password: hashedPassword,
		},
	});

	console.log("Creating wallets...");

	// Create wallets
	const wallet1 = await prisma.wallet.upsert({
		where: { userId: user1.id },
		update: {},
		create: {
			userId: user1.id,
			fiatBalance: 1000.0,
			btcBalance: 0.5,
		},
	});

	const wallet2 = await prisma.wallet.upsert({
		where: { userId: user2.id },
		update: {},
		create: {
			userId: user2.id,
			fiatBalance: 750.0,
			btcBalance: 0.25,
		},
	});

	console.log("Creating sample transactions...");

	// Create sample transactions
	await prisma.transaction.create({
		data: {
			userId: user1.id,
			amount: 100.0,
			type: "INCOME",
			category: "WALLET",
			note: "Initial deposit",
			status: "COMPLETED",
			walletId: wallet1.id,
		},
	});

	await prisma.transaction.create({
		data: {
			userId: user1.id,
			senderId: user1.id,
			receiverId: user2.id,
			amount: 50.0,
			type: "EXPENSE",
			category: "P2P",
			note: "Payment for dinner",
			status: "COMPLETED",
			walletId: wallet1.id,
		},
	});

	await prisma.transaction.create({
		data: {
			userId: user2.id,
			senderId: user1.id,
			receiverId: user2.id,
			amount: 50.0,
			type: "INCOME",
			category: "P2P",
			note: "Payment for dinner",
			status: "COMPLETED",
			walletId: wallet2.id,
		},
	});

	console.log("Creating virtual cards...");

	// Create sample virtual cards
	await prisma.virtualCard.create({
		data: {
			cardNumber: "4532123456789012",
			expiryDate: "12/28",
			cvv: "123",
			walletId: wallet1.id,
		},
	});

	console.log("Creating expense categories...");

	// Create expense categories
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

	console.log("Demo data created successfully!");
	console.log("\nLogin credentials:");
	console.log("User: alice@demo.com / password123");
	console.log("User: bob@demo.com / password123");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
