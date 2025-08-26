import React, { useState } from "react";
import TransactionsList from "../components/TransactionList";
import TransferForm from "../components/TransferForm";
import UserList from "../components/UserList";

const Transactions = () => {
	const [refreshTrigger, setRefreshTrigger] = useState(0);
	const [selectedUser, setSelectedUser] = useState(null);

	const handleTransactionAdded = (transaction) => {
		console.log("New transaction added:", transaction);
		// Trigger refresh of transaction list
		setRefreshTrigger((prev) => prev + 1);
	};

	const handleUserSelect = (user) => {
		setSelectedUser(user);
		// You can also trigger the form to auto-fill with this user
		window.dispatchEvent(new CustomEvent("userSelected", { detail: user }));
	};

	return (
		<div className="p-6 max-w-6xl mx-auto">
			<h1 className="text-3xl font-bold mb-6">💳 Transactions</h1>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
				<div className="lg:col-span-2">
					<TransferForm
						onTransactionAdded={handleTransactionAdded}
						selectedUser={selectedUser}
					/>
				</div>
				<div>
					<UserList onUserSelect={handleUserSelect} />
				</div>
			</div>

			<TransactionsList refreshTrigger={refreshTrigger} />
		</div>
	);
};

export default Transactions;
