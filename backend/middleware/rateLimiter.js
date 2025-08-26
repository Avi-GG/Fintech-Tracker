// middleware/rateLimiter.js
import rateLimit from "express-rate-limit";

// General API rate limiter
export const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
	message: {
		error: "Too many requests from this IP, please try again later.",
	},
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for auth endpoints
export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // limit each IP to 10 requests per windowMs
	message: {
		error: "Too many authentication attempts, please try again later.",
	},
	skipSuccessfulRequests: true, // Don't count successful requests
});

// Transaction rate limiter
export const transactionLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 20, // limit each IP to 20 transactions per minute
	message: {
		error: "Too many transactions, please slow down.",
	},
});

// Conversion rate limiter
export const conversionLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 10, // limit each IP to 10 conversions per minute
	message: {
		error: "Too many conversion requests, please try again later.",
	},
});
