import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const Login = () => {
	const { login, user } = useAuth();
	const navigate = useNavigate();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [msg, setMsg] = useState("");
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (user) {
			navigate("/dashboard");
		}
	}, [user, navigate]);

	const handleLogin = async (e) => {
		e.preventDefault(); // Prevent form submission
		setMsg("");
		setSuccess(false);
		setLoading(true);

		try {
			const res = await axios.post("/auth/login", { email, password });

			// ✅ On success
			login(res.data.user);
			setSuccess(true);
			setMsg("Login successful! Redirecting...");
			setEmail("");
			setPassword("");

			// Small delay to prevent UI flicker
			setTimeout(() => {
				navigate("/dashboard");
			}, 300);
		} catch (err) {
			// ✅ Show backend errors like "Invalid email or password"
			setMsg(
				err.response?.data?.msg ||
					err.response?.data?.error ||
					"Login failed. Try again."
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-4 max-w-md mx-auto mt-20 bg-gray-100 rounded shadow">
			<h1 className="font-bold text-xl mb-2">Login</h1>

			<form onSubmit={handleLogin}>
				<input
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="border p-2 mb-2 w-full"
					required
				/>
				<input
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="border p-2 mb-2 w-full"
					required
				/>

				<button
					type="submit"
					disabled={loading}
					className={`${
						loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
					} text-white px-4 py-2 rounded w-full transition`}
				>
					{loading ? "Logging in..." : "Login"}
				</button>
			</form>

			<div className="mt-3 text-center">
				<span className="text-gray-600">
					Don’t have an account?{" "}
					<a href="/register" className="text-blue-500 hover:underline">
						Sign up
					</a>
				</span>
			</div>

			{msg && (
				<p
					className={`mt-2 text-center ${
						success ? "text-green-600" : "text-red-600"
					}`}
				>
					{msg}
				</p>
			)}
		</div>
	);
};

export default Login;
