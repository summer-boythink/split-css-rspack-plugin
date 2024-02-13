import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/__tests__/**/*.test.[tj]s"],
    exclude: ["**/node_modules/**", "**/dist/**"],
    testTimeout: 50000,
  },
});
