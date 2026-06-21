import { Router } from "express";
import {
  buyCoinController,
  sellCoinController,
} from "../controllers/trade.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { tradeRateLimiter } from "../middlewares/rate-limit.middleware.js";

export const tradeRouter = Router();

tradeRouter.use(tradeRateLimiter);

tradeRouter.post("/buy", authMiddleware, buyCoinController);
tradeRouter.post("/sell", authMiddleware, sellCoinController);
