import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { fetchMarketCoins } from "../services/coingecko.service.js";

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

coinsRouter.post("/sync", async (_req, res, next) => {
  try {
    const liveCoins = await fetchMarketCoins();

    const syncedCoins = await Promise.all(
      liveCoins.map((coin) =>
        prisma.coin.upsert({
          where: {
            symbol: coin.symbol.toUpperCase(),
          },
          update: {
            name: coin.name,
            image: coin.image,
            price: String(coin.current_price ?? 0),
            change24h: String(coin.price_change_percentage_24h ?? 0),
            marketCap: String(coin.market_cap ?? 0),
            volume24h: String(coin.total_volume ?? 0),
          },
          create: {
            name: coin.name,
            symbol: coin.symbol.toUpperCase(),
            image: coin.image,
            price: String(coin.current_price ?? 0),
            change24h: String(coin.price_change_percentage_24h ?? 0),
            marketCap: String(coin.market_cap ?? 0),
            volume24h: String(coin.total_volume ?? 0),
          },
        }),
      ),
    );

    res.json({
      success: true,
      message: "Coins synced successfully",
      data: syncedCoins,
    });
  } catch (error) {
    next(error);
  }
});
