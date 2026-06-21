import type { CorsOptions } from "cors";
import { AppError } from "../utils/app-error.js";

const allowedOrigins = (
  process.env.CORS_ORIGINS ?? "http://localhost:3000,http://127.0.0.1:3000"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // curl, Postman, mobile app, server-to-server request
    // Origin header nadaran.
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new AppError("Origin is not allowed by CORS", 403));
  },

  methods: ["GET", "POST", "PATCH", "DELETE"],

  allowedHeaders: ["Content-Type", "Authorization"],

  credentials: false,

  optionsSuccessStatus: 204,

  maxAge: 86400,
};
