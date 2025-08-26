import { useState, useEffect } from "react";
import axios from "../api/axiosInstance";

const ConversionHistory = () => {
	const [conversions, setConversions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const fetchConversions = async () => {
		try {
			setLoading(true);
			const res = await axios.get("/api/transactions", {
				withCredentials: true,
			});

			console.log("Transactions API response:", res.data);

			// Check if res.data has transactions property
			const transactionsArray = res.data.transactions || res.data || [];

			// Ensure we have an array before filtering
			if (!Array.isArray(transactionsArray)) {
				console.error(
					"Expected transactions array but got:",
					transactionsArray
				);
				setError("Invalid transaction data format");
				return;
			}

			// Filter only conversion transactions
			const conversionTransactions = transactionsArray.filter(
				(transaction) =>
					transaction.category === "CRYPTO" &&
					transaction.note &&
					transaction.note.includes("Converted")
			);

			console.log("Found conversion transactions:", conversionTransactions);
			setConversions(conversionTransactions);
		} catch (err) {
			setError("Failed to fetch conversion history");
			console.error("Fetch conversions error:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchConversions();
	}, []);

	// Listen for new conversions
	useEffect(() => {
		const handleConversionComplete = () => {
			fetchConversions();
		};

		window.addEventListener("conversionComplete", handleConversionComplete);
		return () =>
			window.removeEventListener(
				"conversionComplete",
				handleConversionComplete
			);
	}, []);

	if (loading) {
		return (
			<div className="p-4 bg-white rounded shadow mt-6">
				<h3 className="text-lg font-semibold mb-3">🔄 Conversion History</h3>
				<p className="text-gray-500">Loading...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-4 bg-white rounded shadow mt-6">
				<h3 className="text-lg font-semibold mb-3">🔄 Conversion History</h3>
				<p className="text-red-500">{error}</p>
			</div>
		);
	}

	return (
		<div className="p-4 bg-white rounded shadow mt-6">
			<div className="flex justify-between items-center mb-3">
				<h3 className="text-lg font-semibold">🔄 Conversion History</h3>
				<button
					onClick={fetchConversions}
					className="text-blue-500 text-sm hover:underline"
				>
					Refresh
				</button>
			</div>

			{conversions.length > 0 ? (
				<div className="space-y-3">
					{conversions.map((conversion) => {
						const isUsdToBtc = conversion.note.includes("USD to");
						const fromCurrency = isUsdToBtc ? "USD" : "BTC";
						const toCurrency = isUsdToBtc ? "BTC" : "USD";

						return (
							<div
								key={conversion.id}
								className="flex items-center justify-between p-3 bg-gray-50 rounded border"
							>
								<div className="flex items-center space-x-3">
									<span className="text-2xl">
										{isUsdToBtc ? "💵➡️₿" : "₿➡️💵"}
									</span>
									<div>
										<p className="font-medium text-sm">{conversion.note}</p>
										<p className="text-xs text-gray-500">
											{new Date(conversion.createdAt).toLocaleDateString(
												"en-US",
												{
													year: "numeric",
													month: "short",
													day: "numeric",
													hour: "2-digit",
													minute: "2-digit",
												}
											)}
										</p>
									</div>
								</div>
								<div className="text-right">
									<div
										className={`font-semibold ${
											conversion.type === "EXPENSE"
												? "text-red-600"
												: "text-green-600"
										}`}
									>
										{conversion.type === "EXPENSE" ? "-" : "+"}$
										{conversion.amount.toFixed(2)}
									</div>
									<div className="text-xs text-gray-500 capitalize">
										{conversion.status.toLowerCase()}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<div className="text-center py-6">
					<p className="text-gray-500">No conversions yet.</p>
					<p className="text-sm text-gray-400">
						Start converting currencies to see your history here.
					</p>
				</div>
			)}
		</div>
	);
};

export default ConversionHistory;
