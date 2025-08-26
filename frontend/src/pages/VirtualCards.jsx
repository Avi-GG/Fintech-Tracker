import { useState, useEffect } from "react";
import axios from "../api/axiosInstance";

const VirtualCards = () => {
	const [cards, setCards] = useState([]);
	const [message, setMessage] = useState("");
	const [showCardDetails, setShowCardDetails] = useState({});

	const fetchCards = async () => {
		try {
			const res = await axios.get("/api/virtual-cards");
			setCards(res.data);
		} catch (err) {
			setMessage(err.response?.data?.error || "Failed to fetch cards");
		}
	};

	useEffect(() => {
		fetchCards();
	}, []);

	const handleCreateCard = async () => {
		try {
			await axios.post("/api/virtual-cards");
			fetchCards();
			setMessage("");
		} catch (err) {
			setMessage(err.response?.data?.error || "Failed to create card");
		}
	};

	const toggleCardDetails = (cardId) => {
		setShowCardDetails((prev) => ({
			...prev,
			[cardId]: !prev[cardId],
		}));
	};

	const formatCardNumber = (cardNumber, hideDetails = true) => {
		if (hideDetails) {
			return `•••• •••• •••• ${cardNumber.slice(-4)}`;
		}
		return cardNumber.replace(/(.{4})/g, "$1 ").trim();
	};

	const copyToClipboard = (text, type) => {
		navigator.clipboard.writeText(text);
		setMessage(`${type} copied to clipboard!`);
		setTimeout(() => setMessage(""), 2000);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-800 mb-2">
							Virtual Cards
						</h1>
						<p className="text-gray-600">
							Manage your virtual payment cards for secure online transactions
						</p>
					</div>
					<button
						onClick={handleCreateCard}
						className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
					>
						+ Create New Card
					</button>
				</div>

				{/* Message */}
				{message && (
					<div
						className={`mb-6 p-4 rounded-lg ${
							message.includes("copied") || message.includes("success")
								? "bg-green-100 text-green-700 border border-green-200"
								: "bg-red-100 text-red-700 border border-red-200"
						}`}
					>
						{message}
					</div>
				)}

				{/* Demo Notice */}
				<div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<svg
								className="h-5 w-5 text-amber-400"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fillRule="evenodd"
									d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						<div className="ml-3">
							<p className="text-sm text-amber-700">
								<strong>Demo Mode:</strong> These are simulated virtual cards
								for demonstration purposes. They cannot be used for real
								transactions.
							</p>
						</div>
					</div>
				</div>

				{/* Cards Grid */}
				{cards.length === 0 ? (
					<div className="text-center py-12">
						<div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
							<svg
								className="w-12 h-12 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
								/>
							</svg>
						</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							No virtual cards yet
						</h3>
						<p className="text-gray-500 mb-6">
							Create your first virtual card to get started with secure online
							payments
						</p>
						<button
							onClick={handleCreateCard}
							className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
						>
							Create Your First Card
						</button>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
						{cards.map((card) => (
							<div key={card.id} className="group">
								{/* Card Design */}
								<div className="relative h-56 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
									{/* Card Background Pattern */}
									<div className="absolute inset-0 opacity-10">
										<div className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full"></div>
										<div className="absolute top-8 right-8 w-8 h-8 bg-white rounded-full"></div>
									</div>

									{/* Card Content */}
									<div className="relative h-full p-6 flex flex-col justify-between text-white">
										{/* Top Section */}
										<div className="flex justify-between items-start">
											<div>
												<p className="text-xs uppercase tracking-wider opacity-75">
													Virtual Card
												</p>
												<p className="text-sm font-medium mt-1">Demo Card</p>
											</div>
											<div className="text-right">
												<svg
													className="w-8 h-8 opacity-80"
													viewBox="0 0 24 24"
													fill="currentColor"
												>
													<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
													<path d="M2 8h20M6 16h4" />
												</svg>
											</div>
										</div>

										{/* Card Number */}
										<div className="my-4">
											<p className="text-lg font-mono tracking-wider">
												{formatCardNumber(
													card.cardNumber,
													!showCardDetails[card.id]
												)}
											</p>
										</div>

										{/* Bottom Section */}
										<div className="flex justify-between items-end">
											<div>
												<p className="text-xs opacity-75">EXPIRES</p>
												<p className="text-sm font-medium">
													{showCardDetails[card.id] ? card.expiryDate : "••/••"}
												</p>
											</div>
											<div>
												<p className="text-xs opacity-75">CVV</p>
												<p className="text-sm font-medium">
													{showCardDetails[card.id] ? card.cvv : "•••"}
												</p>
											</div>
										</div>
									</div>
								</div>

								{/* Card Controls */}
								<div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
									<div className="flex justify-between items-center">
										<button
											onClick={() => toggleCardDetails(card.id)}
											className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200"
										>
											<svg
												className="w-4 h-4 mr-1"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d={
														showCardDetails[card.id]
															? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
															: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
													}
												/>
											</svg>
											{showCardDetails[card.id] ? "Hide" : "Show"} Details
										</button>

										{showCardDetails[card.id] && (
											<div className="flex space-x-2">
												<button
													onClick={() =>
														copyToClipboard(card.cardNumber, "Card number")
													}
													className="text-gray-600 hover:text-gray-700 p-1 rounded transition-colors duration-200"
													title="Copy card number"
												>
													<svg
														className="w-4 h-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
														/>
													</svg>
												</button>
												<button
													onClick={() => copyToClipboard(card.cvv, "CVV")}
													className="text-gray-600 hover:text-gray-700 p-1 rounded transition-colors duration-200"
													title="Copy CVV"
												>
													<svg
														className="w-4 h-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
														/>
													</svg>
												</button>
											</div>
										)}
									</div>

									<div className="mt-3 pt-3 border-t border-gray-100">
										<p className="text-xs text-gray-500">
											Created {new Date(card.createdAt).toLocaleDateString()}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default VirtualCards;
