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
		<nav className="bg-white shadow-md p-4 flex justify-between items-center">
			<div className="flex gap-6">
				{links.map((link) => (
					<Link
						key={link.path}
						to={link.path}
						className={`font-medium ${
							location.pathname === link.path
								? "text-blue-600 underline"
								: "text-gray-700 hover:text-blue-500"
						}`}
					>
						{link.label}
					</Link>
				))}
			</div>
			{user && (
				<button
					onClick={handleLogout}
					className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
				>
					Logout
				</button>
			)}
		</nav>
	);
}
