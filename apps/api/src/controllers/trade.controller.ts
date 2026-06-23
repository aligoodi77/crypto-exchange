import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import {
  buyCoinSchema,
  idempotencyKeySchema,
  sellCoinSchema,
} from "../schemas/trade.schema.js";
import { buyCoin, sellCoin } from "../services/trade.service.js";
import { AppError } from "../utils/app-error.js";

function getIdempotencyKey(req: AuthenticatedRequest) {
  const idempotencyKey = req.headers["idempotency-key"];

  if (typeof idempotencyKey !== "string") {
    throw new AppError("Idempotency-Key header is required", 400);
  }

  return idempotencyKeySchema.parse(idempotencyKey);
}

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
    const idempotencyKey = getIdempotencyKey(req);
    const result = await buyCoin(req.user.userId, input, idempotencyKey);

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
    const idempotencyKey = getIdempotencyKey(req);
    const result = await sellCoin(req.user.userId, input, idempotencyKey);

    res.status(200).json({
      success: true,
      message: "Coin sold successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
