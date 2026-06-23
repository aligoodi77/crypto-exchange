import { createServer } from "node:http";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { startCoinSyncCron } from "./jobs/coin-sync.cron.js";
import { initializeSocketServer } from "./realtime/socket.server.js";
import { syncCoinMarketData } from "./services/coin-sync.service.js";

async function startBackgroundJobs() {
  if (!env.enableInternalCron) {
    console.log("[coin-sync] Internal cron is disabled.");
    return;
  }

  startCoinSyncCron();

  try {
    console.log("[coin-sync] Running initial sync...");

    const coins = await syncCoinMarketData();

    console.log(
      `[coin-sync] Initial sync completed. ${coins.length} coins updated.`,
    );
  } catch (error) {
    console.error("[coin-sync] Initial sync failed:", error);
  }
}

const httpServer = createServer(app);

initializeSocketServer(httpServer);

httpServer.listen(env.port, async () => {
  console.log(`API running on http://localhost:${env.port}`);

  void startBackgroundJobs();
  startCoinSyncCron();

  try {
    console.log("[coin-sync] Running initial sync...");
    const coins = await syncCoinMarketData();

    console.log(
      `[coin-sync] Initial sync completed. ${coins.length} coins updated.`,
    );
  } catch (error) {
    console.error("[coin-sync] Initial sync failed:", error);
  }
});
