import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";

const UserList = ({ onUserSelect }) => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const response = await axios.get("/api/transactions/search-users?q=");
			setUsers(response.data);
			setError(null);
		} catch (err) {
			console.error("Failed to fetch users:", err);
			setError("Failed to load users");
		} finally {
			setLoading(false);
		}
	};

	const handleUserClick = (user) => {
		if (onUserSelect) {
			onUserSelect(user);
		}
	};

	if (loading) {
		return (
			<div className="bg-white border rounded-lg p-4 shadow-sm">
				<h3 className="text-lg font-semibold mb-3">👥 Send Money To</h3>
				<div className="flex items-center justify-center py-8">
					<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
					<span className="ml-2 text-gray-500">Loading users...</span>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-white border rounded-lg p-4 shadow-sm">
				<h3 className="text-lg font-semibold mb-3">👥 Send Money To</h3>
				<div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded">
					{error}
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white border rounded-lg p-4 shadow-sm">
			<h3 className="text-lg font-semibold mb-3">👥 Send Money To</h3>

			{users.length === 0 ? (
				<div className="text-center py-8">
					<div className="text-gray-400 text-2xl mb-2">👤</div>
					<p className="text-gray-500 text-sm">No users available</p>
				</div>
			) : (
				<div className="space-y-2 max-h-80 overflow-y-auto">
					{users.map((user) => (
						<button
							key={user.id}
							onClick={() => handleUserClick(user)}
							className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
						>
							<div className="flex items-center space-x-3">
								<div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
									{user.name
										? user.name.charAt(0).toUpperCase()
										: user.email.charAt(0).toUpperCase()}
								</div>
								<div className="flex-1 min-w-0">
									<div className="font-medium text-gray-900 truncate">
										{user.name || "No name"}
									</div>
									<div className="text-sm text-gray-500 truncate">
										{user.email}
									</div>
								</div>
								<div className="text-blue-500">
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
											d="M12 4v16m8-8H4"
										/>
									</svg>
								</div>
							</div>
						</button>
					))}
				</div>
			)}

			<div className="mt-4 pt-3 border-t border-gray-200">
				<button
					onClick={fetchUsers}
					className="w-full text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
				>
					🔄 Refresh Users
				</button>
			</div>
		</div>
	);
};

export default UserList;
