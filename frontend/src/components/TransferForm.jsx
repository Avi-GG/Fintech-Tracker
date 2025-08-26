import { useState, useEffect } from "react";
import axios from "../api/axiosInstance";

export default function TransferForm({
	onTransactionAdded,
	selectedUser: propSelectedUser,
}) {
	const [form, setForm] = useState({
		to: "",
		amount: "",
		note: "",
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [searchLoading, setSearchLoading] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);

	// Listen for user selection events from UserList
	useEffect(() => {
		const handleUserSelected = (event) => {
			const user = event.detail;
			setSelectedUser(user);
			setForm((prev) => ({ ...prev, to: user.email }));
			setSearchResults([]);
		};

		window.addEventListener("userSelected", handleUserSelected);
		return () => window.removeEventListener("userSelected", handleUserSelected);
	}, []);

	// Handle prop changes
	useEffect(() => {
		if (propSelectedUser) {
			setSelectedUser(propSelectedUser);
			setForm((prev) => ({ ...prev, to: propSelectedUser.email }));
			setSearchResults([]);
		}
	}, [propSelectedUser]);

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
		setError(""); // Clear error when user starts typing
		setSuccess("");

		// Clear selected user when typing
		if (e.target.name === "to") {
			setSelectedUser(null);
		}
	};

	// Search users as user types
	useEffect(() => {
		const searchUsers = async () => {
			if (form.to.length >= 2 && !selectedUser) {
				setSearchLoading(true);
				try {
					const response = await axios.get(
						`/api/transactions/search-users?q=${form.to}`,
						{
							withCredentials: true,
						}
					);
					setSearchResults(response.data);
				} catch (err) {
					console.error("User search error:", err);
					setSearchResults([]);
				} finally {
					setSearchLoading(false);
				}
			} else {
				setSearchResults([]);
			}
		};

		const debounce = setTimeout(searchUsers, 300);
		return () => clearTimeout(debounce);
	}, [form.to, selectedUser]);

	const selectUser = (user) => {
		setSelectedUser(user);
		setForm({ ...form, to: user.email }); // Use email as the identifier
		setSearchResults([]);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");

		// Basic validation
		if (!form.to || !form.amount) {
			setError("Recipient and amount are required");
			setLoading(false);
			return;
		}

		if (parseFloat(form.amount) <= 0) {
			setError("Amount must be greater than 0");
			setLoading(false);
			return;
		}

		try {
			const res = await axios.post(
				"/api/transactions/transfer",
				{
					to: form.to, // Now using email/name instead of numeric ID
					amount: parseFloat(form.amount),
					note: form.note,
				},
				{
					withCredentials: true,
				}
			);

			setSuccess(
				`Successfully transferred ₹${form.amount} to ${
					selectedUser?.displayName || form.to
				}`
			);
			setForm({ to: "", amount: "", note: "" }); // reset form
			setSelectedUser(null);

			// Clear success message after 5 seconds
			setTimeout(() => setSuccess(""), 5000);

			if (onTransactionAdded) {
				onTransactionAdded(res.data.transaction); // update parent
			}
		} catch (err) {
			console.error("Transfer error:", err);

			// Handle specific error cases
			if (err.response?.status === 400) {
				const errorData = err.response.data;
				if (errorData.error?.includes("Insufficient balance")) {
					setError(
						`❌ Insufficient balance! You have ₹${
							errorData.available?.toFixed(2) || "0.00"
						} available, but need ₹${
							errorData.required?.toFixed(2) || form.amount
						}. 
						
💡 Please click the "Deposit" button in your wallet to add money first, then try the transfer again.`
					);
				} else {
					setError(errorData.error || "Invalid transfer request.");
				}
			} else if (err.response?.status === 404) {
				setError(err.response.data.error || "User or wallet not found.");
			} else {
				setError("Transfer failed. Please try again or contact support.");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-4 border rounded bg-white shadow mb-6">
			<h2 className="text-lg font-semibold mb-3">💸 Make a Transfer</h2>

			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-3">
					{error}
				</div>
			)}

			{success && (
				<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-3">
					{success}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-3">
				<div className="relative">
					<label className="block text-sm font-medium mb-1">
						Send To (Name or Email)
					</label>
					<input
						type="text"
						name="to"
						value={form.to}
						onChange={handleChange}
						placeholder="Search by name or email..."
						required
						className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
						autoComplete="off"
					/>

					{/* Selected User Display */}
					{selectedUser && (
						<div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
							<div className="flex items-center justify-between">
								<div>
									<span className="font-medium text-green-800">
										{selectedUser.displayName}
									</span>
									<span className="text-sm text-green-600 ml-2">
										({selectedUser.email})
									</span>
								</div>
								<button
									type="button"
									onClick={() => {
										setSelectedUser(null);
										setForm({ ...form, to: "" });
									}}
									className="text-green-600 hover:text-green-800"
								>
									✕
								</button>
							</div>
						</div>
					)}

					{/* Search Results */}
					{searchResults.length > 0 && !selectedUser && (
						<div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
							{searchResults.map((user) => (
								<button
									key={user.id}
									type="button"
									onClick={() => selectUser(user)}
									className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
								>
									<div className="font-medium">{user.displayName}</div>
									<div className="text-sm text-gray-600">{user.email}</div>
								</button>
							))}
						</div>
					)}

					{/* Loading indicator for search */}
					{searchLoading && (
						<div className="absolute right-3 top-9 text-gray-400">
							<div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
						</div>
					)}

					<small className="text-gray-500">
						Start typing to search for users by name or email
					</small>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Amount (₹)</label>
					<input
						type="number"
						step="0.01"
						name="amount"
						value={form.amount}
						onChange={handleChange}
						placeholder="0.00"
						required
						className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">
						Note (Optional)
					</label>
					<input
						type="text"
						name="note"
						value={form.note}
						onChange={handleChange}
						placeholder="What's this for?"
						className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed w-full"
				>
					{loading ? "Sending..." : "Send Money"}
				</button>
			</form>
		</div>
	);
}
