// src/hooks/useSocket.js
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const useSocket = (url, userId = null) => {
	const [socket, setSocket] = useState(null);
	const [connected, setConnected] = useState(false);

	useEffect(() => {
		const socketInstance = io(url, {
			transports: ["websocket", "polling"],
		});

		socketInstance.on("connect", () => {
			console.log("Connected to server");
			setConnected(true);

			// Join user-specific room if userId is provided
			if (userId) {
				socketInstance.emit("joinUser", userId);
			}
		});

		socketInstance.on("disconnect", () => {
			console.log("Disconnected from server");
			setConnected(false);
		});

		socketInstance.on("connect_error", (error) => {
			console.error("Connection error:", error);
			setConnected(false);
		});

		setSocket(socketInstance);

		return () => {
			socketInstance.disconnect();
		};
	}, [url, userId]);

	return { socket, connected };
};

export default useSocket;
