import type { NextFunction, Request, Response } from "express";

import { getMarketsQuerySchema } from "../schemas/market.schema.js";
import { getMarkets } from "../services/market.service.js";

export async function getMarketsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = getMarketsQuerySchema.parse(req.query);

    const result = await getMarkets(query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}
