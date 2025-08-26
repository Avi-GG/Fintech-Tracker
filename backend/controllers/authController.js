// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma/prismaClient.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

// Register new user
export const register = async (req, res) => {
	try {
		const { name, email, password } = req.body;

		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			return res.status(400).json({ msg: "User already exists" });
		}

		// Hash password
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		// Create user
		const user = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
			},
		});

		// Create wallet for user
		await prisma.wallet.create({
			data: {
				userId: user.id,
				fiatBalance: 0.0,
				btcBalance: 0.0,
			},
		});

		// Generate JWT
		const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
			expiresIn: "7d",
		});

		// Set cookie
		res.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		res.status(201).json({
			msg: "User created successfully",
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
			},
		});
	} catch (error) {
		console.error("Register error:", error);
		res.status(500).json({ msg: "Server error" });
	}
};

// Login user
export const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Find user
		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			return res.status(400).json({ msg: "Invalid credentials" });
		}

		// Check password
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ msg: "Invalid credentials" });
		}

		// Generate JWT
		const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
			expiresIn: "7d",
		});

		// Set cookie
		res.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		res.json({
			msg: "Login successful",
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
			},
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ msg: "Server error" });
	}
};

// Get current user (the missing /me endpoint)
export const getMe = async (req, res) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: req.user.id },
			select: {
				id: true,
				name: true,
				email: true,
				createdAt: true,
			},
		});

		if (!user) {
			return res.status(404).json({ msg: "User not found" });
		}

		res.json(user);
	} catch (error) {
		console.error("GetMe error:", error);
		res.status(500).json({ msg: "Server error" });
	}
};

// Logout user
export const logout = async (req, res) => {
	try {
		res.clearCookie("token");
		res.json({ msg: "Logged out successfully" });
	} catch (error) {
		console.error("Logout error:", error);
		res.status(500).json({ msg: "Server error" });
	}
};

// Refresh token
export const refreshToken = async (req, res) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: req.user.id },
		});

		if (!user) {
			return res.status(404).json({ msg: "User not found" });
		}

		// Generate new JWT
		const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
			expiresIn: "7d",
		});

		// Set new cookie
		res.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		res.json({ msg: "Token refreshed successfully" });
	} catch (error) {
		console.error("Refresh token error:", error);
		res.status(500).json({ msg: "Server error" });
	}
};
