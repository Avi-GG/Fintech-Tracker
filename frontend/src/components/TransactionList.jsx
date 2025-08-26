// src/components/TransactionsList.jsx
import { useEffect, useState } from "react";
import { getTransactions } from "../api/transactionService";
import { io } from "socket.io-client";

// Initialize socket connection
let socket = null;
const initializeSocket = () => {
	if (!socket) {
		socket = io("http://localhost:3001", {
			transports: ["websocket", "polling"],
		});
	}
	return socket;
};

const TransactionsList = ({ refreshTrigger }) => {
	const [transactions, setTransactions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchTransactions = async () => {
			try {
				setLoading(true);
				setError("");
				const data = await getTransactions();
				console.log("Transactions received:", data);

				// Handle different response formats
				const transactionList = data.transactions || data || [];
				setTransactions(transactionList);
			} catch (error) {
				console.error("Error fetching transactions:", error);
				setError(error.response?.data?.error || "Failed to load transactions");
			} finally {
				setLoading(false);
			}
		};

		fetchTransactions();
	}, [refreshTrigger]);

	// Enhanced real-time Socket.IO listener for recipients
	useEffect(() => {
		const socketInstance = initializeSocket();

		// Get current user info from localStorage
		const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
		const currentUserId = userInfo.id;

		console.log("Setting up Socket.IO listeners for user:", currentUserId);

		// Join user-specific room
		if (currentUserId) {
			socketInstance.emit("joinUser", currentUserId);
			console.log("Joined Socket.IO room for user:", currentUserId);
		}

		// Listen for transaction updates specifically for recipients
		const handleTransactionUpdate = (data) => {
			console.log("TransactionList: Received transactionUpdate:", data);

			// Check if this update is relevant to current user
			if (
				data.transaction &&
				(data.transaction.senderId === currentUserId ||
					data.transaction.receiverId === currentUserId)
			) {
				console.log("TransactionList: Adding new transaction for current user");

				// Add the new transaction to the top of the list and remove duplicates
				setTransactions((prev) => {
					const newTransaction = data.transaction;
					// Remove any existing transaction with same ID to prevent duplicates
					const filteredTransactions = prev.filter(
						(t) => t.id !== newTransaction.id
					);
					return [newTransaction, ...filteredTransactions];
				});
			}
		};

		// Listen for wallet updates (which include transaction info)
		const handleWalletUpdate = (data) => {
			console.log("TransactionList: Received walletUpdate:", data);

			// If wallet update includes transaction info, handle it
			if (
				data.transaction &&
				(data.transaction.senderId === currentUserId ||
					data.transaction.receiverId === currentUserId)
			) {
				console.log(
					"TransactionList: Processing wallet update with transaction"
				);

				setTransactions((prev) => {
					const newTransaction = data.transaction;
					const filteredTransactions = prev.filter(
						(t) => t.id !== newTransaction.id
					);
					return [newTransaction, ...filteredTransactions];
				});
			}
		};

		// Set up all event listeners
		socketInstance.on("transactionUpdate", handleTransactionUpdate);
		socketInstance.on("walletUpdate", handleWalletUpdate);

		// Custom event listener (fallback)
		const handleNewTransaction = (event) => {
			const newTransaction = event.detail;
			console.log(
				"TransactionList: Custom event - New transaction:",
				newTransaction
			);

			// Add the new transaction to the top of the list
			setTransactions((prev) => {
				const filteredTransactions = prev.filter(
					(t) => t.id !== newTransaction.id
				);
				return [newTransaction, ...filteredTransactions];
			});
		};

		window.addEventListener("newTransaction", handleNewTransaction);

		// Cleanup
		return () => {
			socketInstance.off("transactionUpdate", handleTransactionUpdate);
			socketInstance.off("walletUpdate", handleWalletUpdate);
			window.removeEventListener("newTransaction", handleNewTransaction);
		};
	}, []);

	// Listen for real-time transaction updates (keeping original for compatibility)
	useEffect(() => {
		const handleNewTransaction = (event) => {
			const newTransaction = event.detail;
			console.log(
				"TransactionList: Legacy event - New transaction received:",
				newTransaction
			);

			// Add the new transaction to the top of the list
			setTransactions((prev) => {
				const filteredTransactions = prev.filter(
					(t) => t.id !== newTransaction.id
				);
				return [newTransaction, ...filteredTransactions];
			});
		};

		window.addEventListener("newTransaction", handleNewTransaction);
		return () =>
			window.removeEventListener("newTransaction", handleNewTransaction);
	}, []);

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getTransactionDisplay = (txn) => {
		if (txn.category === "P2P") {
			// P2P transfers - show recipient info for outgoing, sender info for incoming
			const otherUser = txn.type === "EXPENSE" ? txn.receiver : txn.sender;

			// Enhanced user name resolution
			let otherUserName = "Unknown User";

			if (otherUser && (otherUser.name || otherUser.email)) {
				// If we have the user object with name or email, use it
				otherUserName = otherUser.name || otherUser.email;
			} else if (txn.note) {
				// Fallback: extract name from transaction note
				if (txn.type === "EXPENSE" && txn.note.includes("Transfer to ")) {
					otherUserName = txn.note.replace("Transfer to ", "");
				} else if (
					txn.type === "INCOME" &&
					txn.note.includes("Received from ")
				) {
					otherUserName = txn.note.replace("Received from ", "");
				}
			}

			return {
				description: `${
					txn.type === "EXPENSE" ? "Sent to" : "Received from"
				} ${otherUserName}`,
				note: txn.note || "",
				isIncome: txn.type === "INCOME",
			};
		} else if (txn.category === "CRYPTO") {
			// Crypto conversions
			return {
				description: "Crypto Conversion",
				note: txn.note || "",
				isIncome: txn.type === "INCOME",
			};
		} else if (txn.category === "DEPOSIT") {
			// Deposits
			return {
				description: "Deposit",
				note: txn.note || "",
				isIncome: true,
			};
		} else {
			// Default
			return {
				description: txn.note || `${txn.category} ${txn.type}`,
				note: "",
				isIncome: txn.type === "INCOME",
			};
		}
	};

	if (loading)
		return (
			<div className="flex items-center justify-center py-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
				<span className="ml-2 text-gray-500">Loading transactions...</span>
			</div>
		);

	if (error)
		return (
			<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
				{error}
			</div>
		);

	if (transactions.length === 0)
		return (
			<div className="text-center py-8">
				<div className="text-gray-400 text-4xl mb-2">💳</div>
				<p className="text-gray-500">No transactions yet.</p>
				<p className="text-gray-400 text-sm">
					Make a transfer or deposit to see transactions here.
				</p>
			</div>
		);

	return (
		<div className="mt-6">
			<h2 className="text-lg font-semibold mb-3">📋 Recent Transactions</h2>
			<div className="space-y-2">
				{transactions.map((txn) => {
					const display = getTransactionDisplay(txn);
					return (
						<div
							key={txn.id}
							className="flex justify-between items-center bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
						>
							<div className="flex-1">
								<div className="flex items-center gap-2">
									<span
										className={`text-2xl ${display.isIncome ? "💰" : "💸"}`}
									>
										{display.isIncome ? "💰" : "💸"}
									</span>
									<div>
										<p className="font-medium text-gray-900">
											{display.description}
										</p>
										{display.note && (
											<p className="text-sm text-gray-500">{display.note}</p>
										)}
										<p className="text-xs text-gray-400">
											{formatDate(txn.createdAt)} • {txn.status}
										</p>
									</div>
								</div>
							</div>
							<div className="text-right">
								<p
									className={`font-bold text-lg ${
										display.isIncome ? "text-green-600" : "text-red-600"
									}`}
								>
									{display.isIncome ? "+" : "-"}${txn.amount}
								</p>
								<p className="text-xs text-gray-500 uppercase">
									{txn.category}
								</p>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default TransactionsList;
