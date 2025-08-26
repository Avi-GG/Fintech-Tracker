import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
	const location = useLocation();
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	const links = [
		{ path: "/dashboard", label: "Dashboard" },
		{ path: "/expenses", label: "Expenses" },
		{ path: "/transactions", label: "Transactions" },
		{ path: "/convert", label: "Convert" },
		{ path: "/virtual-cards", label: "Virtual Cards" },
	];

	return (
		<nav className="bg-white shadow-md border-b border-gray-200">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<span className="text-lg font-semibold text-orange-600">
						Welcome, {user?.name || user?.email}
					</span>
					<div className="flex space-x-8 justify-center items-center">
						{links.map((link) => (
							<Link
								key={link.path}
								to={link.path}
								className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
									location.pathname === link.path
										? "bg-blue-50 text-blue-700 shadow-sm"
										: "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
								}`}
							>
								{link.label}
								{location.pathname === link.path && (
									<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></div>
								)}
							</Link>
						))}
					</div>
					{user && (
						<div className="flex items-center space-x-4">
							<button
								onClick={handleLogout}
								className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
							>
								Logout
							</button>
						</div>
					)}
				</div>
			</div>
		</nav>
	);
}
