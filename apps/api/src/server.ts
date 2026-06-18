import "dotenv/config";
import express from "express";
import cors from "cors";
import { coinsRouter } from "./routes/coins.routes.js";
import { authRouter } from "./routes/auth.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "API is running",
  });
});

app.use("/api/coins", coinsRouter);
app.use("/api/auth", authRouter);

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal server error",
    });
  },
);

const port = Number(process.env.PORT) || 4000;

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
