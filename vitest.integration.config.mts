import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "node", setupFiles: ["./tests/integration/setup.ts"], globalSetup: "./tests/integration/prepare.ts",
    include: ["tests/integration/**/*.test.ts"], fileParallelism: false,
    testTimeout: 30_000, hookTimeout: 180_000, restoreMocks: true,
  },
});
