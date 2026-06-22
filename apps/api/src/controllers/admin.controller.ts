import type { Request, Response, NextFunction } from "express";

import {
  adminTransactionsQuerySchema,
  adminUsersQuerySchema,
  idParamSchema,
  updateCoinStatusSchema,
} from "../schemas/admin.schema.js";

import {
  getAdminCoins,
  getAdminStats,
  getAdminTransactions,
  getAdminUserById,
  getAdminUsers,
  updateAdminCoinStatus,
} from "../services/admin.service.js";

import { syncCoinMarketData } from "../services/coin-sync.service.js";

export async function getAdminStatsController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await getAdminStats();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminUsersController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = adminUsersQuerySchema.parse(req.query);

    const data = await getAdminUsers(query);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminUserController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = idParamSchema.parse(req.params);

    const data = await getAdminUserById(id);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminTransactionsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = adminTransactionsQuerySchema.parse(req.query);

    const data = await getAdminTransactions(query);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminCoinsController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await getAdminCoins();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminCoinStatusController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = idParamSchema.parse(req.params);

    const input = updateCoinStatusSchema.parse(req.body);

    const data = await updateAdminCoinStatus(id, input);

    res.json({
      success: true,
      message: "Coin status updated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function manualCoinSyncController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const coins = await syncCoinMarketData();

    res.json({
      success: true,
      message: "Coins synced successfully",
      data: {
        count: coins.length,
        syncedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
}

