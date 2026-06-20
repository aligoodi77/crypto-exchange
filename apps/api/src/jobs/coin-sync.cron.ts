import cron from "node-cron";
import { syncCoinMarketData } from "../services/coin-sync.service.js";

const cronExpression = process.env.COIN_SYNC_CRON || "*/5 * * * *";

export function startCoinSyncCron() {
  if (!cron.validate(cronExpression)) {
    throw new Error(`Invalid COIN_SYNC_CRON value: ${cronExpression}`);
  }

  cron.schedule(cronExpression, async () => {
    try {
      console.log("[coin-sync] Starting scheduled sync...");

      const coins = await syncCoinMarketData();

      console.log(
        `[coin-sync] Completed successfully. ${coins.length} coins updated.`,
      );
    } catch (error) {
      console.error("[coin-sync] Scheduled sync failed:", error);
    }
  });

  console.log(`[coin-sync] Scheduler started: ${cronExpression}`);
}
