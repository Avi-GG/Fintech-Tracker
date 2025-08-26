// src/pages/Dashboard.jsx
import React, { useState } from "react";
import WalletCard from "../components/WalletCard";
import CryptoPriceFeed from "../components/CryptoPriceFeed";
import AddExpense from "../components/AddExpense";
import ExpenseAnalytics from "../components/ExpenseAnalytics";
import RecentExpenses from "../components/RecentExpenses";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
	const { user } = useAuth();
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	const handleExpenseAdded = (expense) => {
		console.log("New expense added:", expense);
		// Trigger refresh of analytics and recent expenses
		setRefreshTrigger((prev) => prev + 1);
	};

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold">Dashboard</h1>
				<div className="flex items-center space-x-4">
					<span className="text-gray-600">Welcome, {user?.name}</span>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="space-y-6">
					<WalletCard />
					<AddExpense onExpenseAdded={handleExpenseAdded} />
					<RecentExpenses limit={5} key={refreshTrigger} />
				</div>
				<div className="space-y-6">
					<CryptoPriceFeed />
					<ExpenseAnalytics key={refreshTrigger} />
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
