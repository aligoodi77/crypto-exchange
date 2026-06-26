import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import { env } from "./config/env.js";
import { corsOptions } from "./config/cors.js";
import { authRouter } from "./routes/auth.routes.js";
import { coinsRouter } from "./routes/coins.routes.js";
import { walletRouter } from "./routes/wallet.routes.js";
import { tradeRouter } from "./routes/trade.routes.js";
import { transactionRouter } from "./routes/transaction.routes.js";
import { marketRouter } from "./routes/market.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./docs/openapi.js";

export const app = express();

if (env.nodeEnv === "production") {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));

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

app.get("/api-docs.json", (_req, res) => {
  res.json(openApiDocument);
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    explorer: true,
    customSiteTitle: "Crypto Exchange API Docs",
  }),
);
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorMiddleware);
