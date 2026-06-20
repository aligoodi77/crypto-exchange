import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { buyCoinSchema, sellCoinSchema } from "../schemas/trade.schema.js";
import { buyCoin, sellCoin } from "../services/trade.service.js";

export async function buyCoinController(
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

    const input = buyCoinSchema.parse(req.body);
    const result = await buyCoin(req.user.userId, input);

    res.status(201).json({
      success: true,
      message: "Coin bought successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function sellCoinController(
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
    const input = sellCoinSchema.parse(req.body);
    const result = await sellCoin(req.user.userId, input);

    res.status(200).json({
      success: true,
      message: "Coin sold successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
