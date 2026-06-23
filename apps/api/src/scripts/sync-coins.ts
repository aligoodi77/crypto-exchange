import { prisma } from "../lib/prisma.js";
import { syncCoinMarketData } from "../services/coin-sync.service.js";

async function main() {
  try {
    console.log("[coin-sync] Manual cron execution started.");

    const coins = await syncCoinMarketData();

    console.log(
      `[coin-sync] Manual cron execution completed. ${coins.length} coins updated.`,
    );
  } catch (error) {
    console.error("[coin-sync] Manual cron execution failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main();
