import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { fetchMarketCoins } from "../services/coingecko.service.js";
import { syncCoinMarketData } from "../services/coin-sync.service.js";
import { AppError } from "../utils/app-error.js";

export const coinsRouter = Router();

coinsRouter.get("/", async (_req, res, next) => {
  try {
    const coins = await prisma.coin.findMany({
      orderBy: {
        marketCap: "desc",
      },
    });

    res.json({
      success: true,
      data: coins,
    });
  } catch (error) {
    next(error);
  }
});

coinsRouter.get("/live", async (_req, res, next) => {
  try {
    const coins = await fetchMarketCoins();

    res.json({
      success: true,
      data: coins,
    });
  } catch (error) {
    next(error);
  }
});

coinsRouter.post("/sync", async (req, res, next) => {
  try {
    const syncSecret = req.headers["x-sync-secret"];

    if (
      typeof syncSecret !== "string" ||
      syncSecret !== process.env.SYNC_SECRET
    ) {
      throw new AppError("Unauthorized sync request", 401);
    }

    const syncedCoins = await syncCoinMarketData();

    res.json({
      success: true,
      message: "Coins synced successfully",
      data: {
        count: syncedCoins.length,
        syncedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});
