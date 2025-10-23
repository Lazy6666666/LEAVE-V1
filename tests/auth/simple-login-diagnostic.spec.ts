// Simple diagnostic test without fixtures
import { test, expect } from "@playwright/test";

test("simple login diagnostic", async ({ page }) => {
  console.log("=== SIMPLE LOGIN DIAGNOSTIC ===");

  try {
    // Navigate to login page
    await page.goto("/login");
    console.log("✓ Navigated to login page");

    // Wait for page to load
    await page.waitForLoadState("networkidle");
    console.log("✓ Page loaded");

    // Check if login form exists
    const emailInput = page.locator('input[name="email"], input[type="email"]');
    const passwordInput = page.locator('input[name="password"], input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    console.log("Email input exists:", await emailInput.count() > 0);
    console.log("Password input exists:", await passwordInput.count() > 0);
    console.log("Submit button exists:", await submitButton.count() > 0);

    if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
      // Fill form with demo credentials
      await emailInput.fill("test@example.com");
      await passwordInput.fill("password123");
      console.log("✓ Form filled");

      // Submit form
      await submitButton.click();
      console.log("✓ Form submitted");

      // Wait for navigation or timeout
      try {
        await page.waitForURL("**/dashboard**", { timeout: 8000 });
        console.log("✓ Navigation to dashboard successful");

        // Check dashboard content
        const title = await page.title();
        console.log("Dashboard page title:", title);

        // Look for any welcome message
        const pageContent = await page.content();
        const hasWelcome = pageContent.toLowerCase().includes("welcome");
        console.log("Page contains welcome message:", hasWelcome);

        if (!hasWelcome) {
          console.log("❌ ISSUE IDENTIFIED: No welcome message found on dashboard");
          console.log("This is likely why the test is failing");
        }

      } catch (navError) {
        console.log("❌ Navigation failed:", navError.message);
        const currentUrl = page.url();
        console.log("Current URL:", currentUrl);

        // Check for errors
        const errorElements = page.locator('[role="alert"], .error');
        const errorCount = await errorElements.count();
        if (errorCount > 0) {
          for (let i = 0; i < errorCount; i++) {
            const errorText = await errorElements.nth(i).textContent();
            console.log("Error found:", errorText);
          }
        }
      }
    } else {
      console.log("❌ Login form not found");
    }

  } catch (error) {
    console.log("❌ Test failed with error:", error.message);
  }

  // Take screenshot
  await page.screenshot({ path: "simple-diagnostic-result.png", fullPage: true });
  console.log("✓ Screenshot saved");

  console.log("=== DIAGNOSTIC COMPLETE ===");
});