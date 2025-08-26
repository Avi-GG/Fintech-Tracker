import { createContext, useContext, useState, useEffect } from "react";
import axios from "../api/axiosInstance";

// Create Context
const AuthContext = createContext();

// Provider
export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null); // store user object
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Check localStorage for cached user data immediately
		const cachedUser = localStorage.getItem("user");
		if (cachedUser) {
			try {
				const userData = JSON.parse(cachedUser);
				setUser(userData);
			} catch (error) {
				// Invalid cached data, clear it
				localStorage.removeItem("user");
				setUser(null);
			}
		} else {
			setUser(null);
		}
		// Set loading to false immediately to prevent flickering
		setLoading(false);
	}, []);

	// Function to check auth when actually needed (after login attempts)
	const checkAuth = async () => {
		try {
			const response = await axios.get("/auth/me");
			setUser(response.data);
			localStorage.setItem("user", JSON.stringify(response.data));
			return response.data;
		} catch (error) {
			// Only log unexpected errors
			if (error.response?.status !== 401) {
				console.error("Auth check failed:", error.message);
			}
			setUser(null);
			localStorage.removeItem("user");
			return null;
		}
	};

	const login = (userData) => {
		setUser(userData);
		localStorage.setItem("user", JSON.stringify(userData));
	};

	const logout = async () => {
		try {
			await axios.post("/auth/logout");
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			setUser(null);
			localStorage.removeItem("user");
		}
	};

	return (
		<AuthContext.Provider value={{ user, login, logout, loading, checkAuth }}>
			{children}
		</AuthContext.Provider>
	);
};

// Hook
export const useAuth = () => useContext(AuthContext);
