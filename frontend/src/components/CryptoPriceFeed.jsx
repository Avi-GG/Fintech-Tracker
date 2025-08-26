import { useState, useEffect } from "react";
import useSocket from "../hooks/useSocket";

const CryptoPriceFeed = () => {
	const [price, setPrice] = useState(null);
	const [error, setError] = useState(null);
	const [lastUpdate, setLastUpdate] = useState(null);
	const { socket, connected } = useSocket("http://localhost:3001");

	const requestPrice = () => {
		if (socket) {
			console.log("Manually requesting crypto price");
			socket.emit("requestCryptoPrice");
			setError(null);
		}
	};

	useEffect(() => {
		if (socket) {
			socket.on("cryptoPriceUpdate", (data) => {
				console.log("Crypto price data received:", data);

				try {
					// Handle different possible data structures
					if (data && data.bitcoin && data.bitcoin.usd) {
						setPrice(data.bitcoin.usd);
						setError(null);
						setLastUpdate(new Date().toLocaleTimeString());
					} else if (data && typeof data === "number") {
						setPrice(data);
						setError(null);
						setLastUpdate(new Date().toLocaleTimeString());
					} else {
						console.error("Invalid crypto price data structure:", data);
						setError("Invalid price data received");
					}
				} catch (err) {
					console.error("Error processing crypto price:", err);
					setError("Error processing price data");
				}
			});

			socket.on("connect_error", (err) => {
				console.error("Socket connection error:", err);
				setError("Connection error");
			});

			socket.on("cryptoPriceError", (data) => {
				console.error("Crypto price error from server:", data);
				setError(data.error || "Failed to fetch price data");
			});

			// Request initial price data
			socket.emit("requestCryptoPrice");

			return () => {
				socket.off("cryptoPriceUpdate");
				socket.off("connect_error");
				socket.off("cryptoPriceError");
			};
		}
	}, [socket]);

	return (
		<div className="p-4 bg-gray-100 rounded shadow mt-4">
			<div className="flex justify-between items-center mb-2">
				<h2 className="font-bold text-lg">Live Bitcoin Price</h2>
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

			{error ? (
				<div>
					<p className="text-red-500 text-sm mb-2">{error}</p>
					<div className="flex gap-2">
						<button
							onClick={requestPrice}
							className="text-blue-500 text-sm underline"
						>
							Retry
						</button>
						<button
							onClick={() => window.location.reload()}
							className="text-gray-500 text-sm underline"
						>
							Refresh Page
						</button>
					</div>
				</div>
			) : price ? (
				<div>
					<p className="text-2xl font-semibold text-green-600">
						${price.toLocaleString()}
					</p>
					{lastUpdate && (
						<p className="text-xs text-gray-500 mt-1">
							Last updated: {lastUpdate}
						</p>
					)}
				</div>
			) : (
				<div>
					<p className="text-gray-500">Loading...</p>
					<p className="text-xs text-gray-400 mt-1">
						{connected ? "Waiting for price data..." : "Connecting..."}
					</p>
				</div>
			)}
		</div>
	);
};

export default CryptoPriceFeed;
