// @ts-nocheck - Suppressing type checking for diagnostic test
import { test, expect } from "@playwright/test";

test.describe("Login Flow Diagnostic Test", () => {
  test("should diagnose login authentication flow", async ({ page }) => {
    console.log("=== LOGIN FLOW DIAGNOSTIC TEST ===");

    // Step 1: Navigate to login page
    await page.goto("/login");
    console.log("✓ Navigated to login page");

    // Step 2: Verify login page elements
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign In")');

    console.log("Email input visible:", await emailInput.isVisible());
    console.log("Password input visible:", await passwordInput.isVisible());
    console.log("Submit button visible:", await submitButton.isVisible());

    // Step 3: Fill login form with demo credentials
    await emailInput.fill("employee@test.com");
    await passwordInput.fill("Test123456!");
    console.log("✓ Filled login form");

    // Step 4: Check current URL before submission
    const urlBefore = page.url();
    console.log("URL before submission:", urlBefore);

    // Step 5: Submit form and measure timing
    const startTime = Date.now();
    await submitButton.click();
    console.log("✓ Clicked submit button");

    // Step 6: Monitor URL changes
    try {
      await page.waitForURL("**/dashboard**", { timeout: 10000 });
      const urlAfter = page.url();
      const loadTime = Date.now() - startTime;
      console.log("✓ URL changed to:", urlAfter);
      console.log("✓ Navigation time:", loadTime, "ms");
    } catch (error) {
      console.log("❌ URL change failed:", error.message);
      const currentUrl = page.url();
      console.log("Current URL:", currentUrl);

      // Check for error messages
      const errorElements = page.locator('[role="alert"], .error, [data-testid="error"]');
      const errorCount = await errorElements.count();
      console.log("Error elements found:", errorCount);

      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          const errorText = await errorElements.nth(i).textContent();
          console.log(`Error ${i + 1}:`, errorText);
        }
      }
    }

    // Step 7: Check dashboard content
    const currentUrl = page.url();
    if (currentUrl.includes("/dashboard")) {
      console.log("✓ Dashboard loaded successfully");

      // Look for expected dashboard elements
      const dashboardTitle = page.locator("h1");
      const titleText = await dashboardTitle.textContent();
      console.log("Dashboard title:", titleText);

      // Look for welcome messages
      const welcomeSelectors = [
        "text=Welcome back",
        "text=Welcome",
        "[data-testid='welcome-message']",
        ".welcome-message"
      ];

      for (const selector of welcomeSelectors) {
        try {
          const element = page.locator(selector);
          if (await element.isVisible()) {
            const text = await element.textContent();
            console.log(`✓ Found welcome message with selector "${selector}":`, text);
          }
        } catch {
          console.log(`No element found with selector: "${selector}"`);
        }
      }

      // Check for user info
      const userInfoSelectors = [
        "[data-testid='user-info']",
        "[data-testid='user-name']",
        "[data-testid='user-email']",
        "[data-testid='user-role']"
      ];

      console.log("User info elements:");
      for (const selector of userInfoSelectors) {
        try {
          const element = page.locator(selector);
          if (await element.isVisible()) {
            const text = await element.textContent();
            console.log(`✓ Found user info with selector "${selector}":`, text);
          } else {
            console.log(`User info element not visible: "${selector}"`);
          }
        } catch {
          console.log(`No user info element found: "${selector}"`);
        }
      }

      // Get page HTML structure for analysis
      const pageContent = await page.content();
      const hasWelcomeText = pageContent.includes("Welcome") || pageContent.includes("welcome");
      const hasUserSpecificContent = pageContent.includes("employee") || pageContent.includes("Employee");

      console.log("Page contains 'Welcome' text:", hasWelcomeText);
      console.log("Page contains user-specific content:", hasUserSpecificContent);

      if (!hasWelcomeText) {
        console.log("❌ NO WELCOME MESSAGE FOUND - This is likely the test failure point");
      }
    }

    // Step 8: Take screenshot for visual analysis
    await page.screenshot({ path: "diagnostic-login-result.png", fullPage: true });
    console.log("✓ Screenshot saved as diagnostic-login-result.png");

    console.log("=== DIAGNOSTIC TEST COMPLETE ===");
  });
});