// middleware/errorHandler.js
import logger from "../config/logger.js";

// Custom error class
export class AppError extends Error {
	constructor(message, statusCode) {
		super(message);
		this.statusCode = statusCode;
		this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}
}

// Global error handling middleware
export const globalErrorHandler = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || "error";

	// Log error
	logger.error("Error occurred:", {
		message: err.message,
		stack: err.stack,
		statusCode: err.statusCode,
		url: req.originalUrl,
		method: req.method,
		ip: req.ip,
		userAgent: req.get("User-Agent"),
		user: req.user?.id || "Anonymous",
	});

	// Handle specific error types
	let error = { ...err };
	error.message = err.message;

	// Prisma validation error
	if (err.code === "P2002") {
		const message = "Duplicate field value entered";
		error = new AppError(message, 400);
	}

	// Prisma not found error
	if (err.code === "P2025") {
		const message = "Record not found";
		error = new AppError(message, 404);
	}

	// JWT error
	if (err.name === "JsonWebTokenError") {
		const message = "Invalid token. Please log in again!";
		error = new AppError(message, 401);
	}

	// JWT expired error
	if (err.name === "TokenExpiredError") {
		const message = "Your token has expired! Please log in again.";
		error = new AppError(message, 401);
	}

	// Validation error
	if (err.name === "ValidationError") {
		const errors = Object.values(err.errors).map((val) => val.message);
		const message = `Invalid input data. ${errors.join(". ")}`;
		error = new AppError(message, 400);
	}

	sendErrorResponse(error, req, res);
};

// Send error response
const sendErrorResponse = (err, req, res) => {
	// Operational errors: send message to client
	if (err.isOperational) {
		return res.status(err.statusCode).json({
			status: err.status,
			error: err.message,
		});
	}

	// Programming or unknown errors: don't leak details
	console.error("ERROR 💥", err);

	return res.status(500).json({
		status: "error",
		error: "Something went wrong!",
	});
};

// Async error handler wrapper
export const catchAsync = (fn) => {
	return (req, res, next) => {
		fn(req, res, next).catch(next);
	};
};

// 404 handler
export const notFound = (req, res, next) => {
	const err = new AppError(
		`Can't find ${req.originalUrl} on this server!`,
		404
	);
	next(err);
};
