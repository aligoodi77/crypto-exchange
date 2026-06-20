import "dotenv/config";
import express from "express";
import cors from "cors";
import { ZodError } from "zod";

import { authRouter } from "./routes/auth.routes.js";
import { coinsRouter } from "./routes/coins.routes.js";
import { walletRouter } from "./routes/wallet.routes.js";
import { tradeRouter } from "./routes/trade.routes.js";
import { AppError } from "./utils/app-error.js";
import { transactionRouter } from "./routes/transaction.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

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

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  },
);

const port = Number(process.env.PORT) || 4000;

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
