// tests/auth.test.js
import request from "supertest";
import { app } from "../server.js";
import prisma from "../prisma/prismaClient.js";

describe("Authentication", () => {
	beforeEach(async () => {
		// Clean up database
		await prisma.transaction.deleteMany();
		await prisma.virtualCard.deleteMany();
		await prisma.wallet.deleteMany();
		await prisma.user.deleteMany();
	});

	afterAll(async () => {
		await prisma.$disconnect();
	});

	describe("POST /auth/register", () => {
		it("should register a new user", async () => {
			const userData = {
				name: "Test User",
				email: "test@example.com",
				password: "password123",
			};

			const response = await request(app)
				.post("/auth/register")
				.send(userData)
				.expect(201);

			expect(response.body).toHaveProperty(
				"message",
				"User registered successfully"
			);
			expect(response.body).toHaveProperty("user");
			expect(response.body.user.email).toBe(userData.email);
			expect(response.body.user).not.toHaveProperty("password");
		});

		it("should not register user with existing email", async () => {
			const userData = {
				name: "Test User",
				email: "test@example.com",
				password: "password123",
			};

			// Register first user
			await request(app).post("/auth/register").send(userData);

			// Try to register with same email
			const response = await request(app)
				.post("/auth/register")
				.send(userData)
				.expect(400);

			expect(response.body).toHaveProperty("msg", "User already exists");
		});

		it("should validate required fields", async () => {
			const response = await request(app)
				.post("/auth/register")
				.send({})
				.expect(500); // Validation should be added

			// Add proper validation and update this test
		});
	});

	describe("POST /auth/login", () => {
		beforeEach(async () => {
			// Create a test user
			await request(app).post("/auth/register").send({
				name: "Test User",
				email: "test@example.com",
				password: "password123",
			});
		});

		it("should login with valid credentials", async () => {
			const response = await request(app)
				.post("/auth/login")
				.send({
					email: "test@example.com",
					password: "password123",
				})
				.expect(200);

			expect(response.body).toHaveProperty("msg", "Login successful");
			expect(response.body).toHaveProperty("user");
			expect(response.headers["set-cookie"]).toBeDefined();
		});

		it("should not login with invalid credentials", async () => {
			const response = await request(app)
				.post("/auth/login")
				.send({
					email: "test@example.com",
					password: "wrongpassword",
				})
				.expect(400);

			expect(response.body).toHaveProperty("msg", "Invalid email or password");
		});

		it("should not login with non-existent email", async () => {
			const response = await request(app)
				.post("/auth/login")
				.send({
					email: "nonexistent@example.com",
					password: "password123",
				})
				.expect(400);

			expect(response.body).toHaveProperty("msg", "Invalid email or password");
		});
	});

	describe("GET /auth/me", () => {
		let authCookie;

		beforeEach(async () => {
			// Register and login to get auth cookie
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
		});

		it("should return user info when authenticated", async () => {
			const response = await request(app)
				.get("/auth/me")
				.set("Cookie", authCookie)
				.expect(200);

			expect(response.body).toHaveProperty("id");
			expect(response.body).toHaveProperty("email", "test@example.com");
			expect(response.body).toHaveProperty("name", "Test User");
			expect(response.body).not.toHaveProperty("password");
		});

		it("should return 401 when not authenticated", async () => {
			const response = await request(app).get("/auth/me").expect(401);

			expect(response.body).toHaveProperty("msg", "No token provided");
		});
	});

	describe("POST /auth/logout", () => {
		let authCookie;

		beforeEach(async () => {
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
		});

		it("should logout successfully", async () => {
			const response = await request(app)
				.post("/auth/logout")
				.set("Cookie", authCookie)
				.expect(200);

			expect(response.body).toHaveProperty("msg", "Logout successful");
		});

		it("should work even when not authenticated", async () => {
			const response = await request(app).post("/auth/logout").expect(200);

			expect(response.body).toHaveProperty("msg", "Logout successful");
		});
	});
});
