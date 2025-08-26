// Test file to check if the exports are working
import {
	getTransactions,
	transfer,
	searchUsers,
} from "./controllers/transactionController.js";

console.log("getTransactions:", typeof getTransactions);
console.log("transfer:", typeof transfer);
console.log("searchUsers:", typeof searchUsers);
