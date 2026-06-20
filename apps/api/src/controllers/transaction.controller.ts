import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { getMyTransactions } from "../services/transaction.service.js";
import { transactionsQuerySchema } from "../schemas/transaction.schema.js";

export async function getMyTransactionsController(
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

    const query = transactionsQuerySchema.parse(req.query);
    const transactions = await getMyTransactions(req.user.userId, query);

    res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
}
