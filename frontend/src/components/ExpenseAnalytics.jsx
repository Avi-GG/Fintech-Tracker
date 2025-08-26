import { useState, useEffect } from "react";
import axios from "../api/axiosInstance";

const ExpenseAnalytics = () => {
	const [expenses, setExpenses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [timeRange, setTimeRange] = useState("7days");

	useEffect(() => {
		fetchExpenses();
	}, [timeRange]);

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

	const filterExpensesByTimeRange = (expenses) => {
		const now = new Date();
		const timeRanges = {
			"7days": 7,
			"30days": 30,
			"90days": 90,
			"1year": 365,
		};

		const days = timeRanges[timeRange];
		const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

		return expenses.filter((expense) => new Date(expense.date) >= cutoffDate);
	};

	const getExpensesByCategory = () => {
		const filtered = filterExpensesByTimeRange(expenses);
		const categoryTotals = {};

		filtered.forEach((expense) => {
			const category = expense.category.name;
			categoryTotals[category] =
				(categoryTotals[category] || 0) + expense.amount;
		});

		return Object.entries(categoryTotals).map(([name, amount]) => ({
			name,
			amount,
		}));
	};

	const getTotalExpenses = () => {
		const filtered = filterExpensesByTimeRange(expenses);
		return filtered.reduce((sum, expense) => sum + expense.amount, 0);
	};

	const getAverageDaily = () => {
		const filtered = filterExpensesByTimeRange(expenses);
		const timeRanges = { "7days": 7, "30days": 30, "90days": 90, "1year": 365 };
		const days = timeRanges[timeRange];
		const total = filtered.reduce((sum, expense) => sum + expense.amount, 0);
		return total / days;
	};

	const getExpenseTrend = () => {
		const filtered = filterExpensesByTimeRange(expenses);
		const dailyExpenses = {};

		filtered.forEach((expense) => {
			const date = new Date(expense.date).toDateString();
			dailyExpenses[date] = (dailyExpenses[date] || 0) + expense.amount;
		});

		return Object.entries(dailyExpenses)
			.sort(([a], [b]) => new Date(a) - new Date(b))
			.slice(-7); // Last 7 days
	};

	const categoryColors = {
		Food: "#FF6384",
		Transport: "#36A2EB",
		Shopping: "#FFCE56",
		Entertainment: "#4BC0C0",
		Bills: "#9966FF",
		Healthcare: "#FF9F40",
		Education: "#FF6384",
		Other: "#C9CBCF",
	};

	const categoryData = getExpensesByCategory();
	const totalExpenses = getTotalExpenses();
	const averageDaily = getAverageDaily();
	const expenseTrend = getExpenseTrend();

	if (loading) {
		return (
			<div className="p-4 bg-white rounded shadow">
				<h2 className="text-lg font-semibold mb-3">📊 Expense Analytics</h2>
				<p className="text-gray-500">Loading analytics...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-4 bg-white rounded shadow">
				<h2 className="text-lg font-semibold mb-3">📊 Expense Analytics</h2>
				<p className="text-red-500">{error}</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Time Range Selector */}
			<div className="p-4 bg-white rounded shadow">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-lg font-semibold">📊 Expense Analytics</h2>
					<select
						value={timeRange}
						onChange={(e) => setTimeRange(e.target.value)}
						className="border rounded px-3 py-1 text-sm"
					>
						<option value="7days">Last 7 days</option>
						<option value="30days">Last 30 days</option>
						<option value="90days">Last 90 days</option>
						<option value="1year">Last year</option>
					</select>
				</div>

				{/* Summary Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
					<div className="bg-blue-50 p-4 rounded">
						<h3 className="text-sm font-medium text-blue-800">
							Total Expenses
						</h3>
						<p className="text-2xl font-bold text-blue-900">
							₹${totalExpenses.toFixed(2)}
						</p>
					</div>
					<div className="bg-green-50 p-4 rounded">
						<h3 className="text-sm font-medium text-green-800">
							Daily Average
						</h3>
						<p className="text-2xl font-bold text-green-900">
							₹${averageDaily.toFixed(2)}
						</p>
					</div>
					<div className="bg-purple-50 p-4 rounded">
						<h3 className="text-sm font-medium text-purple-800">
							Total Transactions
						</h3>
						<p className="text-2xl font-bold text-purple-900">
							{filterExpensesByTimeRange(expenses).length}
						</p>
					</div>
				</div>

				{/* Category Breakdown */}
				<div className="mb-6">
					<h3 className="text-md font-semibold mb-3">Expenses by Category</h3>
					{categoryData.length > 0 ? (
						<div className="space-y-2">
							{categoryData
								.sort((a, b) => b.amount - a.amount)
								.map((category) => {
									const percentage = (category.amount / totalExpenses) * 100;
									return (
										<div key={category.name} className="flex items-center">
											<div className="w-20 text-sm text-gray-600">
												{category.name}
											</div>
											<div className="flex-1 mx-3">
												<div className="bg-gray-200 rounded-full h-4 relative">
													<div
														className="h-4 rounded-full"
														style={{
															width: `${percentage}%`,
															backgroundColor:
																categoryColors[category.name] || "#C9CBCF",
														}}
													></div>
												</div>
											</div>
											<div className="w-20 text-sm text-right">
												${category.amount.toFixed(2)}
											</div>
											<div className="w-12 text-xs text-gray-500 text-right">
												{percentage.toFixed(1)}%
											</div>
										</div>
									);
								})}
						</div>
					) : (
						<p className="text-gray-500">No expenses found for this period</p>
					)}
				</div>

				{/* Recent Trend */}
				<div>
					<h3 className="text-md font-semibold mb-3">Daily Spending Trend</h3>
					{expenseTrend.length > 0 ? (
						<div className="space-y-2">
							{expenseTrend.map(([date, amount]) => (
								<div key={date} className="flex items-center">
									<div className="w-24 text-sm text-gray-600">
										{new Date(date).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
										})}
									</div>
									<div className="flex-1 mx-3">
										<div className="bg-gray-200 rounded-full h-3 relative">
											<div
												className="bg-blue-500 h-3 rounded-full"
												style={{
													width: `${Math.min(
														(amount /
															Math.max(...expenseTrend.map(([, a]) => a))) *
															100,
														100
													)}%`,
												}}
											></div>
										</div>
									</div>
									<div className="w-20 text-sm text-right">
										${amount.toFixed(2)}
									</div>
								</div>
							))}
						</div>
					) : (
						<p className="text-gray-500">No daily data available</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default ExpenseAnalytics;
