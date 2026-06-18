import express from "express";
import cors from "cors";
import { errorMiddleware } from "./middlewares/error.middleware.js";

export const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "CoinBarrier API is running",
  });
});

app.use(errorMiddleware);
