import {
	createBrowserRouter,
	RouterProvider,
	Outlet,
	Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Convert from "./pages/Convert";
import VirtualCards from "./pages/VirtualCards";
import ExpenseList from "./components/ExpenseList";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";

function Layout() {
	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />
			<main className="flex-1 container mx-auto px-4 py-6">
				<Outlet />
			</main>
		</div>
	);
}

function NotFound() {
	return (
		<div className="text-center mt-20">
			<h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
			<p className="text-gray-600">
				The page you are looking for doesn't exist.
			</p>
		</div>
	);
}

function RootRedirect() {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="text-lg text-gray-600">Loading...</div>
			</div>
		);
	}

	return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}

const router = createBrowserRouter([
	{
		path: "/",
		element: <Layout />,
		children: [
			{ path: "login", element: <Login /> },
			{ path: "register", element: <Register /> },
			{
				index: true,
				element: <RootRedirect />,
			},
			{
				path: "dashboard",
				element: (
					<ProtectedRoute>
						<Dashboard />
					</ProtectedRoute>
				),
			},
			{
				path: "expenses",
				element: (
					<ProtectedRoute>
						<ExpenseList />
					</ProtectedRoute>
				),
			},
			{
				path: "transactions",
				element: (
					<ProtectedRoute>
						<Transactions />
					</ProtectedRoute>
				),
			},
			{
				path: "convert",
				element: (
					<ProtectedRoute>
						<Convert />
					</ProtectedRoute>
				),
			},
			{
				path: "virtual-cards",
				element: (
					<ProtectedRoute>
						<VirtualCards />
					</ProtectedRoute>
				),
			},
		],
	},
	{
		path: "*",
		element: <NotFound />,
	},
]);

export default function App() {
	return (
		<AuthProvider>
			<RouterProvider router={router} />
		</AuthProvider>
	);
}
