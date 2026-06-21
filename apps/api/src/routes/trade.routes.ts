import { Router } from "express";
import {
  buyCoinController,
  sellCoinController,
} from "../controllers/trade.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { tradeRateLimiter } from "../middlewares/rate-limit.middleware.js";
import { verifiedEmailMiddleware } from "../middlewares/verified-email.middleware.js";

export const tradeRouter = Router();

tradeRouter.use(tradeRateLimiter);

tradeRouter.post(
  "/buy",
  authMiddleware,
  verifiedEmailMiddleware,
  buyCoinController,
);
tradeRouter.post(
  "/sell",
  authMiddleware,
  verifiedEmailMiddleware,
  sellCoinController,
);
