import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { getMyWallet } from "../services/wallet.service.js";

export async function getMyWalletController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const wallet = await getMyWallet(req.user.userId);

    res.json({
      success: true,
      data: wallet,
    });
  } catch (error) {
    next(error);
  }
}
