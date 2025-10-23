import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./__tests__/vitest.setup.ts"],
    include: [
      "**/__tests__/unit/**/*.{test,spec}.{js,jsx,ts,tsx}",
      "**/__tests__/integration/**/*.{test,spec}.{js,jsx,ts,tsx}",
    ],
    exclude: [
      "node_modules/",
      ".next/",
      "coverage/",
      "dist/",
      "build/",
      "**/*.config.{js,ts}",
      "**/*.d.ts",
      "**/e2e/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "__tests__/",
        "**/*.d.ts",
        "**/*.config.*",
        "coverage/",
        ".next/",
        "prisma/",
        "dist/",
        "build/",
        "**/stories/**",
        "**/coverage/**",
        "**/stories/**",
        "**/*.stories.*",
        "**/test/**",
        "**/__mocks__/**",
        "**/*.mock.*",
      ],
      thresholds: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        // Per-file thresholds to ensure comprehensive coverage
        'app/**/*.{js,jsx,ts,tsx}': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        'lib/**/*.{js,jsx,ts,tsx}': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'components/**/*.{js,jsx,ts,tsx}': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
      },
      include: [
        "app/**/*.{js,jsx,ts,tsx}",
        "lib/**/*.{js,jsx,ts,tsx}",
        "components/**/*.{js,jsx,ts,tsx}",
      ],
      all: true, // Include all files, not just those touched by tests
      clean: true, // Clean coverage directories before generating
      cleanOnRerun: true, // Clean coverage on rerun
    },
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./"),
      "@/components": resolve(__dirname, "./components"),
      "@/lib": resolve(__dirname, "./lib"),
      "@/app": resolve(__dirname, "./app"),
      "@/types": resolve(__dirname, "./types"),
    },
  },
  define: {
    "process.env.NODE_ENV": '"test"',
  },
});
