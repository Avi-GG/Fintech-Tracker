// src/components/AddTransaction.jsx
import { useState } from "react";
import { addTransaction } from "../api/transactionService";

export default function AddTransaction({ onTransactionAdded }) {
	const [form, setForm] = useState({
		amount: "",
		type: "income",
		category: "",
		description: "",
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const newTransaction = await addTransaction(form);
			setForm({ amount: "", type: "income", category: "", description: "" }); // reset form
			if (onTransactionAdded) {
				onTransactionAdded(newTransaction); // update parent
			}
		} catch (err) {
			setError("Failed to add transaction. Try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-4 border rounded bg-white shadow">
			<h2 className="text-lg font-semibold mb-3">Add Transaction</h2>

			{error && <p className="text-red-500 mb-2">{error}</p>}

			<form onSubmit={handleSubmit} className="space-y-3">
				<div>
					<label className="block text-sm font-medium">Amount</label>
					<input
						type="number"
						name="amount"
						value={form.amount}
						onChange={handleChange}
						required
						className="border p-2 w-full rounded"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium">Type</label>
					<select
						name="type"
						value={form.type}
						onChange={handleChange}
						className="border p-2 w-full rounded"
					>
						<option value="income">Income</option>
						<option value="expense">Expense</option>
					</select>
				</div>

				<div>
					<label className="block text-sm font-medium">Category</label>
					<input
						type="text"
						name="category"
						value={form.category}
						onChange={handleChange}
						placeholder="e.g. Food, Rent"
						className="border p-2 w-full rounded"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium">Description</label>
					<input
						type="text"
						name="description"
						value={form.description}
						onChange={handleChange}
						placeholder="Optional note"
						className="border p-2 w-full rounded"
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
				>
					{loading ? "Adding..." : "Add Transaction"}
				</button>
			</form>
		</div>
	);
}
