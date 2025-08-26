import { useState, useEffect } from "react";
import axios from "../api/axiosInstance";

const RecentExpenses = ({ limit = 5 }) => {
	const [expenses, setExpenses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		fetchExpenses();
	}, []);

	const fetchExpenses = async () => {
		try {
			setLoading(true);
			const res = await axios.get("/api/expenses", {
				withCredentials: true,
			});
			setExpenses(res.data.slice(0, limit));
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

	if (loading) {
		return (
			<div className="p-4 bg-white rounded shadow">
				<h3 className="font-bold text-lg mb-3">🕒 Recent Expenses</h3>
				<p className="text-gray-500">Loading...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-4 bg-white rounded shadow">
				<h3 className="font-bold text-lg mb-3">🕒 Recent Expenses</h3>
				<p className="text-red-500">{error}</p>
			</div>
		);
	}

	return (
		<div className="p-4 bg-white rounded shadow">
			<h3 className="font-bold text-lg mb-3">🕒 Recent Expenses</h3>
			{expenses.length > 0 ? (
				<div className="space-y-3">
					{expenses.map((expense) => (
						<div
							key={expense.id}
							className="flex items-center justify-between p-3 bg-gray-50 rounded"
						>
							<div className="flex items-center space-x-3">
								<span className="text-2xl">
									{categoryEmojis[expense.category.name] || "📝"}
								</span>
								<div>
									<p className="font-medium">{expense.description}</p>
									<p className="text-sm text-gray-500">
										{expense.category.name} •{" "}
										{new Date(expense.date).toLocaleDateString()}
									</p>
								</div>
							</div>
							<div className="text-lg font-semibold text-red-600">
								-${expense.amount.toFixed(2)}
							</div>
						</div>
					))}
				</div>
			) : (
				<p className="text-gray-500">
					No expenses yet. Add your first expense!
				</p>
			)}
		</div>
	);
};

export default RecentExpenses;
