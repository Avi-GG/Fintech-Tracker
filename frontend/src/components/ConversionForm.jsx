// src/components/ConversionForm.jsx
import { useState, useEffect } from "react";
import axios from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const ConversionForm = () => {
	const { user } = useAuth();
	const [from, setFrom] = useState("USD");
	const [to, setTo] = useState("BTC");
	const [amount, setAmount] = useState("");
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const handleConvert = async (e) => {
		e.preventDefault();

		if (!amount || parseFloat(amount) <= 0) {
			setError("Please enter a valid amount");
			return;
		}

		if (from === to) {
			setError("Cannot convert the same currency");
			return;
		}

		try {
			setLoading(true);
			setError("");
			setSuccess("");
			setMessage("");

			console.log(`Converting ${amount} ${from} to ${to}`);

			const res = await axios.post(
				`/api/convert?from=${from}&to=${to}&amount=${amount}`,
				{},
				{ withCredentials: true }
			);

			const { convertedAmount, exchangeRate, wallet } = res.data;

			setSuccess(
				`✅ Successfully converted ${amount} ${from} → ${convertedAmount.toFixed(
					6
				)} ${to}. Wallet updated!`
			);
			setMessage(`Exchange rate: 1 BTC = $${exchangeRate.toLocaleString()}`);
			setAmount(""); // Clear form

			console.log("Conversion successful:", res.data);

			// Trigger wallet refresh
			window.dispatchEvent(new CustomEvent("walletUpdate", { detail: wallet }));

			// Trigger conversion history refresh
			window.dispatchEvent(new CustomEvent("conversionComplete"));
		} catch (err) {
			console.error("Conversion error:", err);
			setError(err.response?.data?.error || "Conversion failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-6 bg-white rounded shadow">
			<h2 className="text-xl font-bold mb-4">💱 Currency Converter</h2>

			<form onSubmit={handleConvert} className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Amount
					</label>
					<input
						type="number"
						step="0.000001"
						placeholder="Enter amount"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
						disabled={loading}
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							From
						</label>
						<select
							value={from}
							onChange={(e) => setFrom(e.target.value)}
							className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
							disabled={loading}
						>
							<option value="USD">💵 USD</option>
							<option value="BTC">₿ BTC</option>
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							To
						</label>
						<select
							value={to}
							onChange={(e) => setTo(e.target.value)}
							className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
							disabled={loading}
						>
							<option value="USD">💵 USD</option>
							<option value="BTC">₿ BTC</option>
						</select>
					</div>
				</div>

				<button
					type="submit"
					disabled={loading || !amount}
					className={`w-full py-2 px-4 rounded font-medium ${
						loading || !amount
							? "bg-gray-300 text-gray-500 cursor-not-allowed"
							: "bg-blue-500 text-white hover:bg-blue-600"
					}`}
				>
					{loading ? "Converting..." : "Convert"}
				</button>
			</form>

			{/* Messages */}
			{error && (
				<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
					<p className="text-red-600 text-sm">❌ {error}</p>
				</div>
			)}

			{success && (
				<div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
					<p className="text-green-600 text-sm">{success}</p>
					{message && <p className="text-gray-600 text-xs mt-1">{message}</p>}
				</div>
			)}
		</div>
	);
};

export default ConversionForm;
