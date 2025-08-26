// src/api/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
	baseURL: "http://localhost:3001", // backend
	withCredentials: true, // cookies sent automatically
});

export default axiosInstance;
