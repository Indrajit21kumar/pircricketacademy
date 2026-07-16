import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./src/test/setup.ts"],
    include: [
      "src/__tests__/**/*.{test,spec}.{ts,tsx}",
      "api/__tests__/**/*.{test,spec}.ts",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}", "api/**/*.ts"],
      exclude: [
        "src/main.tsx",
        "src/test/**",
        "src/index.css",
        "api/__tests__/**",
        "src/__tests__/**",
      ],
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
