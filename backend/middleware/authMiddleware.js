// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import prisma from "../prisma/prismaClient.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

export const authMiddleware = async (req, res, next) => {
	try {
		// Get token from cookie or Authorization header
		let token = req.cookies.token;

		if (!token) {
			const authHeader = req.headers.authorization;
			if (authHeader && authHeader.startsWith("Bearer ")) {
				token = authHeader.substring(7);
			}
		}

		if (!token) {
			return res.status(401).json({ msg: "No token provided" });
		}

		// Verify token
		const decoded = jwt.verify(token, JWT_SECRET);

		// Get user from database
		const user = await prisma.user.findUnique({
			where: { id: decoded.userId },
			select: {
				id: true,
				name: true,
				email: true,
			},
		});

		if (!user) {
			return res
				.status(401)
				.json({ msg: "User not found, authorization denied" });
		}

		req.user = user;
		next();
	} catch (error) {
		console.error("Auth middleware error:", error);

		if (error.name === "JsonWebTokenError") {
			return res.status(401).json({ msg: "Invalid token" });
		}

		if (error.name === "TokenExpiredError") {
			return res.status(401).json({ msg: "Token expired" });
		}

		res.status(500).json({ msg: "Server error" });
	}
};
