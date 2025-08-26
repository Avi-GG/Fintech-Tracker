// src/components/WalletCard.jsx
import { useState, useEffect } from "react";
import useSocket from "../hooks/useSocket";
import axios from "../api/axiosInstance";

const WalletCard = () => {
	const [wallet, setWallet] = useState({
		fiatBalance: 0,
		btcBalance: 0,
		id: null,
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [user, setUser] = useState(null);

	const { socket, connected } = useSocket("http://localhost:3001", user?.id);

	// Re-join user room when user data is available
	useEffect(() => {
		if (socket && connected && user?.id) {
			console.log("Joining user room for:", user.id);
			socket.emit("joinUser", user.id);
		}
	}, [socket, connected, user?.id]);

	// Get user info
	useEffect(() => {
		const getUserInfo = async () => {
			try {
				const userRes = await axios.get("/auth/me");
				setUser(userRes.data);
			} catch (err) {
				console.error("Failed to fetch user info:", err);
				// If user is not authenticated, you might want to redirect to login
				if (err.response?.status === 401) {
					console.log("User not authenticated");
					// window.location.href = '/login'; // uncomment if you want auto-redirect
				}
			}
		};
		getUserInfo();
	}, []);

	useEffect(() => {
		const fetchWallet = async () => {
			try {
				setLoading(true);
				const res = await axios.get("/api/wallet");
				setWallet(res.data);
				setError(null);
			} catch (err) {
				console.error("Failed to fetch wallet:", err);
				setError("Failed to load wallet data");
			} finally {
				setLoading(false);
			}
		};

		fetchWallet();
	}, []);

	useEffect(() => {
		if (socket && connected) {
			// Listen for wallet updates (from P2P transfers)
			socket.on("walletUpdate", (walletData) => {
				console.log("🔔 Received wallet update:", walletData);
				console.log("🔍 Current user ID:", user?.id);
				if (walletData.userId === user?.id) {
					console.log(
						"✅ Wallet update matches current user, updating balance"
					);
					setWallet((prev) => ({
						...prev,
						fiatBalance: walletData.balance,
						btcBalance: walletData.btcBalance,
					}));
				} else {
					console.log("❌ Wallet update doesn't match current user");
				}
			});

			// Listen for balance updates (legacy - keeping for compatibility)
			socket.on("balanceUpdate", (newWallet) => {
				setWallet(newWallet);
			});

			// Listen for new transactions
			socket.on("transactionUpdate", (transactionData) => {
				console.log("🔔 New transaction received:", transactionData);
				console.log("🔍 Current user ID:", user?.id);
				if (transactionData.userId === user?.id) {
					console.log(
						"✅ Transaction update matches current user, dispatching event"
					);
					// Trigger a custom event for TransactionList to listen to
					window.dispatchEvent(
						new CustomEvent("newTransaction", {
							detail: transactionData.transaction,
						})
					);
				} else {
					console.log("❌ Transaction update doesn't match current user");
				}
			});

			// Listen for new transactions (legacy - keeping for compatibility)
			socket.on("newTransaction", (transactionData) => {
				console.log("New transaction:", transactionData);
			});

			return () => {
				socket.off("walletUpdate");
				socket.off("balanceUpdate");
				socket.off("transactionUpdate");
				socket.off("newTransaction");
			};
		}
	}, [socket, connected, user?.id]);

	// Listen for manual wallet updates
	useEffect(() => {
		const handleWalletUpdate = (event) => {
			setWallet(event.detail);
		};

		window.addEventListener("walletUpdate", handleWalletUpdate);
		return () => window.removeEventListener("walletUpdate", handleWalletUpdate);
	}, []);

	const handleDeposit = async () => {
		try {
			const amount = prompt("Enter deposit amount:");
			if (amount && parseFloat(amount) > 0) {
				const response = await axios.post("/api/wallet/deposit", {
					amount: parseFloat(amount),
				});
				// Update wallet balance immediately
				if (response.data.wallet) {
					setWallet(response.data.wallet);
				}
				alert(`Successfully deposited ₹${parseFloat(amount).toFixed(2)}`);
			}
		} catch (err) {
			console.error("Deposit failed:", err);
			alert("Deposit failed: " + (err.response?.data?.error || err.message));
		}
	};

	const handleWithdraw = async () => {
		try {
			const amount = prompt("Enter withdrawal amount:");
			if (amount && parseFloat(amount) > 0) {
				const response = await axios.post("/api/wallet/withdraw", {
					amount: parseFloat(amount),
				});
				// Update wallet balance immediately
				if (response.data.wallet) {
					setWallet(response.data.wallet);
				}
				alert(`Successfully withdrew ₹${parseFloat(amount).toFixed(2)}`);
			}
		} catch (err) {
			console.error("Withdrawal failed:", err);
			alert("Withdrawal failed: " + (err.response?.data?.error || err.message));
		}
	};

	const handleRefresh = async () => {
		try {
			setLoading(true);
			const res = await axios.get("/api/wallet");
			setWallet(res.data);
			setError(null);
		} catch (err) {
			console.error("Failed to refresh wallet:", err);
			setError("Failed to refresh wallet data");
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="p-4 bg-gray-100 rounded shadow">
				<h2 className="font-bold text-lg">Wallet</h2>
				<p>Loading...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-4 bg-red-100 rounded shadow">
				<h2 className="font-bold text-lg text-red-800">Wallet</h2>
				<p className="text-red-600">{error}</p>
			</div>
		);
	}

	return (
		<div className="p-4 bg-gray-100 rounded shadow">
			<div className="flex justify-between items-center mb-4">
				<h2 className="font-bold text-lg">Wallet</h2>
				<div className="flex items-center">
					<span
						className={`w-2 h-2 rounded-full mr-2 ${
							connected ? "bg-green-500" : "bg-red-500"
						}`}
					></span>
					<span className="text-sm text-gray-600">
						{connected ? "Live" : "Disconnected"}
					</span>
				</div>
			</div>

			<div className="space-y-2">
				<p className="text-lg">
					INR:{" "}
					<span className="font-semibold">
						₹{Number(wallet.fiatBalance ?? 0).toFixed(2)}
					</span>
				</p>
				<p className="text-lg">
					BTC:{" "}
					<span className="font-semibold">
						{wallet.btcBalance?.toFixed(6) || "0.000000"} BTC
					</span>
				</p>
			</div>

			<div className="mt-4 space-x-2">
				<button
					onClick={handleDeposit}
					className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
				>
					Deposit
				</button>
				<button
					onClick={handleWithdraw}
					className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
				>
					Withdraw
				</button>
				<button
					onClick={handleRefresh}
					disabled={loading}
					className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
				>
					{loading ? "..." : "Refresh"}
				</button>
			</div>
		</div>
	);
};

export default WalletCard;
