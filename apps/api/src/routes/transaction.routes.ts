import { Router } from "express";
import { getMyTransactionsController } from "../controllers/transaction.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const transactionRouter = Router();

transactionRouter.get("/", authMiddleware, getMyTransactionsController);
