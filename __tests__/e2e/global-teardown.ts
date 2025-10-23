// @ts-nocheck - Suppressing type checking for test file to focus on core application TypeScript errors
import { test as base } from "@playwright/test";

// Global teardown
async function globalTeardown() {
  console.log("Global teardown: Playwright E2E tests completed");
  // Any cleanup logic here
}

export default globalTeardown;
