import { rateLimit } from "express-rate-limit";
import { env } from "../config/env.js";

const skipRateLimitInTests = () => env.nodeEnv === "test";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: skipRateLimitInTests,
  message: {
    success: false,
    message:
      "Too many authentication attempts. Please try again in 15 minutes.",
  },
});

export const tradeRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: skipRateLimitInTests,
  message: {
    success: false,
    message: "Too many trade requests. Please try again in one minute.",
  },
});
