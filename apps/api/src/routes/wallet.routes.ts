import { Router } from "express";
import { getMyWalletController } from "../controllers/wallet.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const walletRouter = Router();

walletRouter.get("/me", authMiddleware, getMyWalletController);
