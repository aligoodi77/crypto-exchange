import type { CorsOptions } from "cors";
import { env } from "./env.js";
import { AppError } from "../utils/app-error.js";

export function isOriginAllowed(origin?: string) {
  // curl, Postman, React Native, server-to-server request
  // Origin header nadaran.
  if (!origin) {
    return true;
  }

  return env.corsOrigins.includes(origin);
}

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, true);
      return;
    }

    callback(new AppError("Origin is not allowed by CORS", 403));
  },

  methods: ["GET", "POST", "PATCH", "DELETE"],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Idempotency-Key",
    "x-sync-secret",
  ],

  credentials: false,

  optionsSuccessStatus: 204,

  maxAge: 86400,
};
