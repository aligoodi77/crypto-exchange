import "dotenv/config";

const requiredEnv = ["DATABASE_URL", "JWT_SECRET"] as const;

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

export const env = {
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET!,
};
