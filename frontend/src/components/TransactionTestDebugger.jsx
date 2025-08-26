// Test component to verify real-time transaction updates
// Place this in any page to test Socket.IO connection and events

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const TransactionTestDebugger = () => {
	const [events, setEvents] = useState([]);
	const [connected, setConnected] = useState(false);
	const [socket, setSocket] = useState(null);

	useEffect(() => {
		const socketInstance = io("http://localhost:3001", {
			transports: ["websocket", "polling"],
		});

		setSocket(socketInstance);

		const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
		const currentUserId = userInfo.id;

		socketInstance.on("connect", () => {
			console.log("Test: Connected to Socket.IO");
			setConnected(true);
			setEvents((prev) => [
				...prev,
				`Connected to Socket.IO as user ${currentUserId}`,
			]);

			if (currentUserId) {
				socketInstance.emit("joinUser", currentUserId);
				setEvents((prev) => [...prev, `Joined room: user_${currentUserId}`]);
			}
		});

		socketInstance.on("disconnect", () => {
			console.log("Test: Disconnected from Socket.IO");
			setConnected(false);
			setEvents((prev) => [...prev, "Disconnected from Socket.IO"]);
		});

		// Listen for transaction updates
		socketInstance.on("transactionUpdate", (data) => {
			console.log("Test: Received transactionUpdate:", data);
			setEvents((prev) => [
				...prev,
				`transactionUpdate: ${JSON.stringify(data, null, 2)}`,
			]);
		});

		// Listen for wallet updates
		socketInstance.on("walletUpdate", (data) => {
			console.log("Test: Received walletUpdate:", data);
			setEvents((prev) => [
				...prev,
				`walletUpdate: ${JSON.stringify(data, null, 2)}`,
			]);
		});

		return () => {
			socketInstance.disconnect();
		};
	}, []);

	const clearEvents = () => {
		setEvents([]);
	};

	return (
		<div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md max-h-96 overflow-y-auto z-50">
			<div className="flex justify-between items-center mb-2">
				<h3 className="font-bold text-sm">Transaction Debug</h3>
				<div className="flex gap-2">
					<span
						className={`text-xs px-2 py-1 rounded ${
							connected
								? "bg-green-100 text-green-800"
								: "bg-red-100 text-red-800"
						}`}
					>
						{connected ? "Connected" : "Disconnected"}
					</span>
					<button
						onClick={clearEvents}
						className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
					>
						Clear
					</button>
				</div>
			</div>
			<div className="text-xs space-y-1">
				{events.length === 0 ? (
					<p className="text-gray-500">Waiting for events...</p>
				) : (
					events.map((event, index) => (
						<div
							key={index}
							className="bg-gray-50 p-2 rounded border-l-2 border-blue-400"
						>
							<pre className="whitespace-pre-wrap">{event}</pre>
						</div>
					))
				)}
			</div>
		</div>
	);
};

export default TransactionTestDebugger;
