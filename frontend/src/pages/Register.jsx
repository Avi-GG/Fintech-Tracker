import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const Register = () => {
	const { login } = useAuth();
	const navigate = useNavigate();

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [msg, setMsg] = useState("");
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleRegister = async (e) => {
		e.preventDefault(); // Prevent form submission
		setMsg("");
		setSuccess(false);
		setLoading(true);

		try {
			const res = await axios.post("/auth/register", { name, email, password });

			// Backend sends { message, user }
			if (res.status === 201) {
				setSuccess(true);
				setMsg("User registered successfully! Please login.");
				// Clear form
				setName("");
				setEmail("");
				setPassword("");
				// Redirect after short delay
				setTimeout(() => {
					navigate("/login");
				}, 1500);
			}
		} catch (err) {
			setMsg(
				err.response?.data?.msg ||
					err.response?.data?.error ||
					"Registration failed. Try again."
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-4 max-w-md mx-auto mt-20 bg-gray-100 rounded shadow">
			<h1 className="font-bold text-xl mb-2">Register</h1>
			<form onSubmit={handleRegister}>
				<input
					type="text"
					placeholder="Name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="border p-2 mb-2 w-full"
					required
				/>
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
					minLength="6"
				/>

				<button
					type="submit"
					disabled={loading}
					className={`${
						loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
					} text-white px-4 py-2 rounded w-full transition`}
				>
					{loading ? "Registering..." : "Register"}
				</button>
			</form>
			<div className="mt-3 text-center">
				<span className="text-gray-600">
					Already have an account?{" "}
					<a href="/login" className="text-blue-500 hover:underline">
						Login
					</a>
				</span>
			</div>{" "}
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

export default Register;
