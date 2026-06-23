import "dotenv/config";
import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    PORT: z.coerce.number().int().min(1).max(65535).default(4000),

    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),

    SYNC_SECRET: z
      .string()
      .min(16, "SYNC_SECRET must be at least 16 characters"),

    CORS_ORIGINS: z
      .string()
      .default("http://localhost:3000,http://127.0.0.1:3000")
      .transform((value) =>
        value
          .split(",")
          .map((origin) => origin.trim())
          .filter(Boolean),
      )
      .refine((origins) => origins.length > 0, {
        message: "CORS_ORIGINS must include at least one origin",
      }),

    COINGECKO_API_KEY: z.string().optional(),

    TRADING_FEE_PERCENT: z.coerce.number().min(0).max(100).default(0.2),

    COIN_SYNC_CRON: z.string().default("*/5 * * * *"),

    FRONTEND_URL: z.string().url().default("http://localhost:3000"),

    EMAIL_PROVIDER: z.enum(["console", "resend"]).default("console"),

    EMAIL_FROM: z.string().optional(),

    RESEND_API_KEY: z.string().optional(),

    ENABLE_INTERNAL_CRON: z
      .enum(["true", "false"])
      .default("true")
      .transform((value) => value === "true"),

    EMAIL_VERIFICATION_TOKEN_TTL_MINUTES: z.coerce
      .number()
      .int()
      .min(1)
      .default(60),
  })
  .superRefine((value, context) => {
    if (value.EMAIL_PROVIDER !== "resend") {
      return;
    }

    if (!value.RESEND_API_KEY) {
      context.addIssue({
        code: "custom",
        path: ["RESEND_API_KEY"],
        message: "RESEND_API_KEY is required when EMAIL_PROVIDER=resend",
      });
    }

    if (!value.EMAIL_FROM) {
      context.addIssue({
        code: "custom",
        path: ["EMAIL_FROM"],
        message: "EMAIL_FROM is required when EMAIL_PROVIDER=resend",
      });
    }
  });

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const message = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");

  throw new Error(`Invalid environment configuration: ${message}`);
}

export const env = {
  nodeEnv: parsedEnv.data.NODE_ENV,
  port: parsedEnv.data.PORT,
  databaseUrl: parsedEnv.data.DATABASE_URL,
  jwtSecret: parsedEnv.data.JWT_SECRET,
  syncSecret: parsedEnv.data.SYNC_SECRET,
  corsOrigins: parsedEnv.data.CORS_ORIGINS,
  coingeckoApiKey: parsedEnv.data.COINGECKO_API_KEY,
  tradingFeePercent: parsedEnv.data.TRADING_FEE_PERCENT,
  coinSyncCron: parsedEnv.data.COIN_SYNC_CRON,
  frontendUrl: parsedEnv.data.FRONTEND_URL,
  emailProvider: parsedEnv.data.EMAIL_PROVIDER,
  emailFrom: parsedEnv.data.EMAIL_FROM,
  resendApiKey: parsedEnv.data.RESEND_API_KEY,
  emailVerificationTokenTtlMinutes:
    parsedEnv.data.EMAIL_VERIFICATION_TOKEN_TTL_MINUTES,
  enableInternalCron: parsedEnv.data.ENABLE_INTERNAL_CRON,
};
