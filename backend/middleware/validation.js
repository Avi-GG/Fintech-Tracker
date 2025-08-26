// middleware/validation.js
import { body, validationResult } from "express-validator";

// Check validation results
export const handleValidationErrors = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({
			error: "Validation failed",
			details: errors.array(),
		});
	}
	next();
};

// Auth validation rules
export const validateRegister = [
	body("email")
		.isEmail()
		.normalizeEmail()
		.withMessage("Valid email is required"),
	body("password")
		.isLength({ min: 6 })
		.withMessage("Password must be at least 6 characters"),
	body("name")
		.trim()
		.isLength({ min: 2 })
		.withMessage("Name must be at least 2 characters"),
	handleValidationErrors,
];

export const validateLogin = [
	body("email")
		.isEmail()
		.normalizeEmail()
		.withMessage("Valid email is required"),
	body("password").notEmpty().withMessage("Password is required"),
	handleValidationErrors,
];

// Transaction validation rules
export const validateTransfer = [
	body("to").isInt({ min: 1 }).withMessage("Valid recipient ID is required"),
	body("amount")
		.isFloat({ min: 0.01 })
		.withMessage("Amount must be greater than 0"),
	body("note")
		.optional()
		.trim()
		.isLength({ max: 255 })
		.withMessage("Note too long"),
	handleValidationErrors,
];

// Wallet validation rules
export const validateAmount = [
	body("amount")
		.isFloat({ min: 0.01 })
		.withMessage("Amount must be greater than 0"),
	handleValidationErrors,
];

// Conversion validation rules
export const validateConversion = [
	body("from").isIn(["INR", "BTC"]).withMessage("Invalid from currency"),
	body("to").isIn(["INR", "BTC"]).withMessage("Invalid to currency"),
	body("amount")
		.isFloat({ min: 0.01 })
		.withMessage("Amount must be greater than 0"),
	handleValidationErrors,
];
