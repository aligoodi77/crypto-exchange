import { prisma } from "../lib/prisma.js";
import { emitMarketPricesUpdated } from "../realtime/socket.emitters.js";
import { fetchMarketCoins } from "./coingecko.service.js";

export async function syncCoinMarketData() {
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
          price: coin.current_price,
          change24h: coin.price_change_percentage_24h ?? 0,
          marketCap: coin.market_cap ?? 0,
          volume24h: coin.total_volume ?? 0,
        },

        create: {
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          image: coin.image,
          price: coin.current_price,
          change24h: coin.price_change_percentage_24h ?? 0,
          marketCap: coin.market_cap ?? 0,
          volume24h: coin.total_volume ?? 0,
        },
      }),
    ),
  );

  emitMarketPricesUpdated(syncedCoins);

  return syncedCoins;
}
