// tests/wallet.test.js
import request from "supertest";
import { app } from "../server.js";
import prisma from "../prisma/prismaClient.js";

describe("Wallet Operations", () => {
	let authCookie;
	let userId;

	beforeEach(async () => {
		// Clean up database
		await prisma.transaction.deleteMany();
		await prisma.virtualCard.deleteMany();
		await prisma.wallet.deleteMany();
		await prisma.user.deleteMany();

		// Create and login test user
		await request(app).post("/auth/register").send({
			name: "Test User",
			email: "test@example.com",
			password: "password123",
		});

		const loginResponse = await request(app).post("/auth/login").send({
			email: "test@example.com",
			password: "password123",
		});

		authCookie = loginResponse.headers["set-cookie"];
		userId = loginResponse.body.user.id;
	});

	afterAll(async () => {
		await prisma.$disconnect();
	});

	describe("GET /api/wallet", () => {
		it("should get wallet for authenticated user", async () => {
			const response = await request(app)
				.get("/api/wallet")
				.set("Cookie", authCookie)
				.expect(200);

			expect(response.body).toHaveProperty("id");
			expect(response.body).toHaveProperty("fiatBalance");
			expect(response.body).toHaveProperty("btcBalance");
			expect(response.body).toHaveProperty("userId", userId);
		});

		it("should create wallet if it does not exist", async () => {
			const response = await request(app)
				.get("/api/wallet")
				.set("Cookie", authCookie)
				.expect(200);

			expect(response.body.fiatBalance).toBe(0);
			expect(response.body.btcBalance).toBe(0);
		});

		it("should require authentication", async () => {
			const response = await request(app).get("/api/wallet").expect(401);

			expect(response.body).toHaveProperty("msg", "No token provided");
		});
	});

	describe("POST /api/wallet/deposit", () => {
		it("should deposit money successfully", async () => {
			const depositAmount = 100.5;

			const response = await request(app)
				.post("/api/wallet/deposit")
				.set("Cookie", authCookie)
				.send({ amount: depositAmount })
				.expect(200);

			expect(response.body).toHaveProperty("message", "Deposit successful");
			expect(response.body.wallet.fiatBalance).toBe(depositAmount);
			expect(response.body).toHaveProperty("transaction");
		});

		it("should reject negative amounts", async () => {
			const response = await request(app)
				.post("/api/wallet/deposit")
				.set("Cookie", authCookie)
				.send({ amount: -50 })
				.expect(400);

			expect(response.body).toHaveProperty("error", "Invalid amount");
		});

		it("should reject zero amount", async () => {
			const response = await request(app)
				.post("/api/wallet/deposit")
				.set("Cookie", authCookie)
				.send({ amount: 0 })
				.expect(400);

			expect(response.body).toHaveProperty("error", "Invalid amount");
		});

		it("should require authentication", async () => {
			const response = await request(app)
				.post("/api/wallet/deposit")
				.send({ amount: 100 })
				.expect(401);
		});
	});

	describe("POST /api/wallet/withdraw", () => {
		beforeEach(async () => {
			// Add some money to wallet first
			await request(app)
				.post("/api/wallet/deposit")
				.set("Cookie", authCookie)
				.send({ amount: 500 });
		});

		it("should withdraw money successfully", async () => {
			const withdrawAmount = 100;

			const response = await request(app)
				.post("/api/wallet/withdraw")
				.set("Cookie", authCookie)
				.send({ amount: withdrawAmount })
				.expect(200);

			expect(response.body).toHaveProperty("message", "Withdrawal successful");
			expect(response.body.wallet.fiatBalance).toBe(400); // 500 - 100
		});

		it("should reject withdrawal exceeding balance", async () => {
			const response = await request(app)
				.post("/api/wallet/withdraw")
				.set("Cookie", authCookie)
				.send({ amount: 1000 }) // More than the 500 deposited
				.expect(500);

			expect(response.body).toHaveProperty("error");
		});

		it("should reject negative amounts", async () => {
			const response = await request(app)
				.post("/api/wallet/withdraw")
				.set("Cookie", authCookie)
				.send({ amount: -50 })
				.expect(400);

			expect(response.body).toHaveProperty("error", "Invalid amount");
		});

		it("should require authentication", async () => {
			const response = await request(app)
				.post("/api/wallet/withdraw")
				.send({ amount: 100 })
				.expect(401);
		});
	});

	describe("POST /api/wallet/transfer", () => {
		let secondUserId;
		let secondUserCookie;

		beforeEach(async () => {
			// Create second user
			await request(app).post("/auth/register").send({
				name: "Second User",
				email: "second@example.com",
				password: "password123",
			});

			const secondLoginResponse = await request(app).post("/auth/login").send({
				email: "second@example.com",
				password: "password123",
			});

			secondUserCookie = secondLoginResponse.headers["set-cookie"];
			secondUserId = secondLoginResponse.body.user.id;

			// Add money to first user's wallet
			await request(app)
				.post("/api/wallet/deposit")
				.set("Cookie", authCookie)
				.send({ amount: 500 });
		});

		it("should transfer money between users", async () => {
			const transferAmount = 100;

			const response = await request(app)
				.post("/api/wallet/transfer")
				.set("Cookie", authCookie)
				.send({
					toUserId: secondUserId,
					amount: transferAmount,
					note: "Test transfer",
				})
				.expect(200);

			expect(response.body).toHaveProperty("message");
			expect(response.body.senderWallet.fiatBalance).toBe(400); // 500 - 100

			// Check recipient wallet
			const recipientWallet = await request(app)
				.get("/api/wallet")
				.set("Cookie", secondUserCookie);

			expect(recipientWallet.body.fiatBalance).toBe(100);
		});

		it("should reject transfer to self", async () => {
			const response = await request(app)
				.post("/api/wallet/transfer")
				.set("Cookie", authCookie)
				.send({
					toUserId: userId,
					amount: 100,
				})
				.expect(400);

			expect(response.body).toHaveProperty(
				"msg",
				"Cannot transfer to yourself"
			);
		});

		it("should reject transfer exceeding balance", async () => {
			const response = await request(app)
				.post("/api/wallet/transfer")
				.set("Cookie", authCookie)
				.send({
					toUserId: secondUserId,
					amount: 1000, // More than available
				})
				.expect(500);

			expect(response.body).toHaveProperty("error");
		});

		it("should reject transfer to non-existent user", async () => {
			const response = await request(app)
				.post("/api/wallet/transfer")
				.set("Cookie", authCookie)
				.send({
					toUserId: "non-existent-id",
					amount: 100,
				})
				.expect(500);

			expect(response.body).toHaveProperty("error");
		});
	});
});
