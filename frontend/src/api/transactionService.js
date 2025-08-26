// src/api/transactionService.js
import api from "./axiosInstance";

export const addTransaction = async (transactionData) => {
	const res = await api.post("/api/transactions", transactionData, {
		withCredentials: true,
	});
	return res.data;
};

export const getTransactions = async () => {
	const res = await api.get("/api/transactions", {
		withCredentials: true,
	});
	return res.data;
};

export const transferMoney = async (transferData) => {
	const res = await api.post("/api/transactions/transfer", transferData, {
		withCredentials: true,
	});
	return res.data;
};
