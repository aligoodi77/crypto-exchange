import "dotenv/config";
import express from "express";
import cors from "cors";

import { corsOptions } from "./config/cors.js";
import { AppError } from "./utils/app-error.js";

import { ZodError } from "zod";

import { authRouter } from "./routes/auth.routes.js";
import { coinsRouter } from "./routes/coins.routes.js";
import { walletRouter } from "./routes/wallet.routes.js";
import { tradeRouter } from "./routes/trade.routes.js";
import { transactionRouter } from "./routes/transaction.routes.js";
import { startCoinSyncCron } from "./jobs/coin-sync.cron.js";
import { syncCoinMarketData } from "./services/coin-sync.service.js";
import { marketRouter } from "./routes/market.routes.js";
import { adminRouter } from "./routes/admin.routes.js";

import helmet from "helmet";

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");

app.use(helmet());

app.use(cors(corsOptions));

app.use(express.json({ limit: "10kb" }));

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "API is running",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/coins", coinsRouter);
app.use("/api/wallet", walletRouter);
app.use("/api/trades", tradeRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/markets", marketRouter);

app.use("/api/admin", adminRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(error);

    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    const possibleError = error as {
      status?: number;
      type?: string;
    };

    if (
      possibleError.status === 413 ||
      possibleError.type === "entity.too.large"
    ) {
      res.status(413).json({
        success: false,
        message: "Request body is too large",
      });
      return;
    }

    if (error instanceof SyntaxError) {
      res.status(400).json({
        success: false,
        message: "Invalid JSON body",
      });
      return;
    }

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  },
);

const port = Number(process.env.PORT) || 4000;

app.listen(port, async () => {
  console.log(`API running on http://localhost:${port}`);

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
