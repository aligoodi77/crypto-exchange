import { Router } from "express";
import { buyCoinController } from "../controllers/trade.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const tradeRouter = Router();

tradeRouter.post("/buy", authMiddleware, buyCoinController);
