import { config } from "dotenv";
import { defineConfig } from "vitest/config";

config({
  path: ".env.test",
  override: true,
});

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    setupFiles: ["./src/test/setup.ts"],

    // Hame test ha yek test database ro share mikonan.
    fileParallelism: false,

    testTimeout: 10_000,
    hookTimeout: 10_000,
  },
});
