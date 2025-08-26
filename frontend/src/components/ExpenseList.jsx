import { useState, useEffect } from "react";
import axios from "../api/axiosInstance";

const ExpenseList = () => {
	const [expenses, setExpenses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [filter, setFilter] = useState("all");
	const [sortBy, setSortBy] = useState("date");

	useEffect(() => {
		fetchExpenses();
	}, []);

	const fetchExpenses = async () => {
		try {
			setLoading(true);
			const res = await axios.get("/api/expenses", {
				withCredentials: true,
			});
			setExpenses(res.data);
		} catch (err) {
			setError("Failed to fetch expenses");
			console.error("Fetch expenses error:", err);
		} finally {
			setLoading(false);
		}
	};

	const categoryEmojis = {
		Food: "🍕",
		Transport: "🚗",
		Shopping: "🛒",
		Entertainment: "🎬",
		Bills: "💡",
		Healthcare: "🏥",
		Education: "📚",
		Other: "📝",
	};

	const getFilteredExpenses = () => {
		let filtered = expenses;

		if (filter !== "all") {
			filtered = filtered.filter((expense) => expense.category.name === filter);
		}

		// Sort expenses
		filtered.sort((a, b) => {
			switch (sortBy) {
				case "date":
					return new Date(b.date) - new Date(a.date);
				case "amount":
					return b.amount - a.amount;
				case "category":
					return a.category.name.localeCompare(b.category.name);
				default:
					return 0;
			}
		});

		return filtered;
	};

	const categories = [...new Set(expenses.map((e) => e.category.name))];
	const filteredExpenses = getFilteredExpenses();
	const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

	if (loading) {
		return (
			<div className="p-6">
				<h1 className="text-2xl font-bold mb-4">All Expenses</h1>
				<p className="text-gray-500">Loading expenses...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6">
				<h1 className="text-2xl font-bold mb-4">All Expenses</h1>
				<p className="text-red-500">{error}</p>
			</div>
		);
	}

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">All Expenses</h1>
				<div className="text-lg font-semibold text-gray-700">
					Total: ₹{totalAmount.toFixed(2)}
				</div>
			</div>

			{/* Filters and Sort */}
			<div className="bg-white p-4 rounded shadow mb-6">
				<div className="flex flex-wrap gap-4 items-center">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Filter by Category:
						</label>
						<select
							value={filter}
							onChange={(e) => setFilter(e.target.value)}
							className="border rounded px-3 py-2"
						>
							<option value="all">All Categories</option>
							{categories.map((category) => (
								<option key={category} value={category}>
									{categoryEmojis[category]} {category}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Sort by:
						</label>
						<select
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value)}
							className="border rounded px-3 py-2"
						>
							<option value="date">Date (Newest First)</option>
							<option value="amount">Amount (Highest First)</option>
							<option value="category">Category (A-Z)</option>
						</select>
					</div>
					<div className="flex items-end">
						<button
							onClick={fetchExpenses}
							className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
						>
							Refresh
						</button>
					</div>
				</div>
			</div>

			{/* Expenses List */}
			<div className="bg-white rounded shadow">
				{filteredExpenses.length > 0 ? (
					<div className="divide-y">
						{filteredExpenses.map((expense) => (
							<div
								key={expense.id}
								className="p-4 hover:bg-gray-50 flex items-center justify-between"
							>
								<div className="flex items-center space-x-4">
									<span className="text-3xl">
										{categoryEmojis[expense.category.name] || "📝"}
									</span>
									<div>
										<h3 className="font-semibold text-lg">
											{expense.description}
										</h3>
										<p className="text-sm text-gray-500">
											{expense.category.name}
										</p>
										<p className="text-xs text-gray-400">
											{new Date(expense.date).toLocaleDateString("en-US", {
												weekday: "short",
												year: "numeric",
												month: "short",
												day: "numeric",
												hour: "2-digit",
												minute: "2-digit",
											})}
										</p>
									</div>
								</div>
								<div className="text-right">
									<div className="text-xl font-bold text-red-600">
										-₹{expense.amount.toFixed(2)}
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="p-8 text-center">
						<p className="text-gray-500 text-lg">
							{filter === "all"
								? "No expenses found. Start tracking your spending!"
								: `No expenses found in ${filter} category.`}
						</p>
					</div>
				)}
			</div>

			{/* Summary Stats */}
			{filteredExpenses.length > 0 && (
				<div className="bg-white p-4 rounded shadow mt-6">
					<h3 className="font-semibold mb-3">Summary</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="text-center p-3 bg-blue-50 rounded">
							<div className="text-2xl font-bold text-blue-600">
								{filteredExpenses.length}
							</div>
							<div className="text-sm text-gray-600">Total Transactions</div>
						</div>
						<div className="text-center p-3 bg-red-50 rounded">
							<div className="text-2xl font-bold text-red-600">
								₹{totalAmount.toFixed(2)}
							</div>
							<div className="text-sm text-gray-600">Total Amount</div>
						</div>
						<div className="text-center p-3 bg-green-50 rounded">
							<div className="text-2xl font-bold text-green-600">
								₹{(totalAmount / filteredExpenses.length).toFixed(2)}
							</div>
							<div className="text-sm text-gray-600">Average Amount</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ExpenseList;
