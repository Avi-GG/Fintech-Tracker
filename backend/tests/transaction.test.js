import request from "supertest";
import express from "express";
import transactionRoutes from "../routes/transactionRoutes";
import { authMiddleware } from "../middleware/authMiddleware";

// Mock the auth middleware
jest.mock("../middleware/authMiddleware", () => ({
  authMiddleware: (req, res, next) => {
    req.user = { id: "test-user-id", role: "USER" };
    next();
  },
}));

const app = express();
app.use(express.json());
app.use("/api/transactions", transactionRoutes);

describe("Transaction Routes", () => {
  it("should get transactions", async () => {
    const res = await request(app).get("/api/transactions");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("transactions");
  });

  it("should fail to transfer to self", async () => {
    const res = await request(app)
      .post("/api/transactions/transfer")
      .send({ to: "test-user-id", amount: 100 });
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual("You cannot send money to yourself");
  });
});
