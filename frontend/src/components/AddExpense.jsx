import { useState } from "react";
import axios from "../api/axiosInstance";

export default function AddExpense({ onExpenseAdded }) {
	const [form, setForm] = useState({
		amount: "",
		description: "",
		category: "Food",
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

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

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
		setError("");
		setSuccess("");
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");

		if (!form.amount || !form.description) {
			setError("Amount and description are required");
			setLoading(false);
			return;
		}

		if (parseFloat(form.amount) <= 0) {
			setError("Amount must be greater than 0");
			setLoading(false);
			return;
		}

		try {
			const res = await axios.post(
				"/api/expenses",
				{
					amount: parseFloat(form.amount),
					description: form.description,
					category: form.category,
				},
				{
					withCredentials: true,
				}
			);

			setSuccess(`Added expense: $${form.amount} for ${form.description}`);
			setForm({ amount: "", description: "", category: "Food" });

			if (onExpenseAdded) {
				onExpenseAdded(res.data);
			}
		} catch (err) {
			console.error("Add expense error:", err);
			setError(err.response?.data?.error || "Failed to add expense");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-4 bg-white rounded shadow">
			<h2 className="text-lg font-semibold mb-3">💰 Add Expense</h2>

			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-3">
					{error}
				</div>
			)}

			{success && (
				<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-3">
					{success}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-3">
				<div>
					<label className="block text-sm font-medium mb-1">Amount ($)</label>
					<input
						type="number"
						step="0.01"
						name="amount"
						value={form.amount}
						onChange={handleChange}
						placeholder="0.00"
						required
						className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Description</label>
					<input
						type="text"
						name="description"
						value={form.description}
						onChange={handleChange}
						placeholder="What did you spend on?"
						required
						className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Category</label>
					<select
						name="category"
						value={form.category}
						onChange={handleChange}
						className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						{categories.map((cat) => (
							<option key={cat} value={cat}>
								{cat}
							</option>
						))}
					</select>
				</div>

				<button
					type="submit"
					disabled={loading}
					className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed w-full"
				>
					{loading ? "Adding..." : "Add Expense"}
				</button>
			</form>
		</div>
	);
}
