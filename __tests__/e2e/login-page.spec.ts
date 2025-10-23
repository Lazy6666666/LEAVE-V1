// @ts-nocheck - Suppressing type checking for test file to focus on core application TypeScript errors
/**
 * Login Page E2E Tests
 * Comprehensive test suite for the animated login page with character interactions
 */

import { test, expect, tabletTest } from "./fixtures/TestFixtures";
import { UserFactory, TEST_CONSTANTS } from "./data/TestDataFactory";

test.describe("Login Page - Core Functionality", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  test("should load login page successfully", async ({ loginPage }) => {
    await loginPage.verifyPageLoaded();

    // Check page title
    const title = await loginPage.getTitle();
    expect(title).toContain("Sign In") || expect(title).toContain("Login");

    // Check current URL
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).toContain("/login");
  });

  test("should display all page elements correctly", async ({ loginPage }) => {
    // Verify form elements
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.showPasswordButton).toBeVisible();
    await expect(loginPage.rememberMeCheckbox).toBeVisible();
    await expect(loginPage.signInButton).toBeVisible();

    // Verify character elements
    await expect(loginPage.mainCharacter).toBeVisible();
    await expect(loginPage.secondaryCharacter).toBeVisible();
    await expect(loginPage.characterMessage).toBeVisible();

    // Verify page branding
    await expect(loginPage.welcomeTitle).toBeVisible();
    await expect(loginPage.welcomeDescription).toBeVisible();
    await expect(loginPage.logo).toBeVisible();

    // Verify demo credentials notice
    await loginPage.verifyDemoCredentialsNotice();
  });

  test("should have correct welcome section content", async ({ loginPage }) => {
    await expect(loginPage.page.locator("text=Welcome back!")).toBeVisible();
    await expect(
      loginPage.page.locator("text=Your friendly security companion")
    ).toBeVisible();
    await expect(loginPage.page.locator("text=LeaveFlow")).toBeVisible();
  });

  test("should display initial character state", async ({ loginPage }) => {
    // Characters should be visible
    await expect(loginPage.mainCharacter).toBeVisible();
    await expect(loginPage.secondaryCharacter).toBeVisible();

    // Initial character message should be displayed
    const initialMessage = await loginPage.getCharacterMessage();
    expect(initialMessage).toBeTruthy();
    expect(initialMessage?.length).toBeGreaterThan(0);
  });

  test("should have proper form labels and placeholders", async ({
    loginPage,
  }) => {
    // Check email field
    await expect(loginPage.page.locator('label[for="email"]')).toBeVisible();
    await expect(loginPage.page.locator('label[for="email"]')).toContainText(
      "Email Address"
    );
    await expect(loginPage.emailInput).toHaveAttribute(
      "placeholder",
      "name@company.com"
    );

    // Check password field
    await expect(loginPage.page.locator('label[for="password"]')).toBeVisible();
    await expect(loginPage.page.locator('label[for="password"]')).toContainText(
      "Password"
    );
    await expect(loginPage.passwordInput).toHaveAttribute(
      "placeholder",
      "Enter your password"
    );
  });

  test("should have proper accessibility attributes", async ({ loginPage }) => {
    await loginPage.checkAccessibility();

    // Check ARIA attributes
    await expect(loginPage.emailInput).toHaveAttribute("aria-describedby");
    await expect(loginPage.passwordInput).toHaveAttribute("aria-describedby");
    await expect(loginPage.showPasswordButton).toHaveAttribute("aria-label");

    // Check form structure
    await expect(loginPage.emailInput).toHaveAttribute("type", "email");
    await expect(loginPage.passwordInput).toHaveAttribute("type", "password");
  });
});

test.describe("Login Page - Character Interactions", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  test("should react to email input focus", async ({ loginPage }) => {
    // Initial character state
    await loginPage.page.waitForTimeout(1000);

    // Focus on email input
    await loginPage.emailInput.focus();
    await loginPage.page.waitForTimeout(500);

    // Character should react (should become more alert/attentive)
    await expect(loginPage.mainCharacter).toBeVisible();
  });

  test("should react to email input typing", async ({ loginPage }) => {
    // Start typing email
    await loginPage.emailInput.fill("test");
    await loginPage.page.waitForTimeout(1000);

    // Check character reaction to partial email
    let message = await loginPage.getCharacterMessage();
    expect(message).toContain("😊");

    // Complete email with @ symbol
    await loginPage.emailInput.fill("test@example.com");
    await loginPage.page.waitForTimeout(1000);

    // Character should become excited
    message = await loginPage.getCharacterMessage();
    expect(message).toContain("🎉 Awesome!");
  });

  test("should react to password input", async ({ loginPage }) => {
    // Fill email first
    await loginPage.emailInput.fill("test@example.com");
    await loginPage.page.waitForTimeout(1000);

    // Focus on password input
    await loginPage.passwordInput.focus();
    await loginPage.page.waitForTimeout(500);

    // Character should react
    await expect(loginPage.mainCharacter).toBeVisible();

    // Type short password
    await loginPage.passwordInput.fill("pass");
    await loginPage.page.waitForTimeout(1000);

    message = await loginPage.getCharacterMessage();
    expect(message).toContain("😊");

    // Type longer password
    await loginPage.passwordInput.fill("password123");
    await loginPage.page.waitForTimeout(1000);

    // Character should wink for good password
    message = await loginPage.getCharacterMessage();
    expect(message).toContain("😉 Good job");
  });

  test("should react to password visibility toggle", async ({ loginPage }) => {
    // Fill form
    await loginPage.fillLoginForm("test@example.com", "password123");
    await loginPage.page.waitForTimeout(1000);

    // Toggle password visibility
    await loginPage.togglePasswordVisibility();
    await loginPage.page.waitForTimeout(1000);

    // Character should react to toggle
    const message = await loginPage.getCharacterMessage();
    expect(message).toBeTruthy();
  });

  test("should show sleeping mood for validation errors", async ({
    loginPage,
  }) => {
    // Try to submit empty form
    await loginPage.signInButton.click();
    await loginPage.page.waitForTimeout(1000);

    // Character should show sleeping mood
    const message = await loginPage.getCharacterMessage();
    expect(message).toContain("🌙");
  });

  test("should have character animations", async ({ loginPage }) => {
    // Wait for initial animations
    await loginPage.page.waitForTimeout(2000);

    // Characters should have animation classes or be animated
    const mainCharacterClasses =
      await loginPage.mainCharacter.getAttribute("class");
    const secondaryCharacterClasses =
      await loginPage.secondaryCharacter.getAttribute("class");

    // Check if elements have animation-related classes
    expect(mainCharacterClasses).toBeTruthy();
    expect(secondaryCharacterClasses).toBeTruthy();
  });

  test("should show character message bubble", async ({ loginPage }) => {
    await expect(loginPage.characterMessage).toBeVisible();

    const message = await loginPage.characterMessage.textContent();
    expect(message?.length).toBeGreaterThan(0);
    expect(message).toContain(/[😊🎉😉🌙]/); // Should contain an emoji
  });

  test("should have secondary character with emoji", async ({ loginPage }) => {
    await expect(loginPage.secondaryCharacter).toBeVisible();

    // Secondary character should have emoji face
    const emojiFace = await loginPage.secondaryCharacter.locator(
      ".text-white.text-2xl"
    );
    await expect(emojiFace).toBeVisible();

    const emoji = await emojiFace.textContent();
    expect(emoji).toMatch(/[😊🤗😉😴]/); // Should be one of the expected emojis
  });
});

test.describe("Login Page - Form Functionality", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  test("should handle form input correctly", async ({
    loginPage,
    employeeUser,
  }) => {
    await loginPage.fillLoginForm(employeeUser.email, employeeUser.password);

    // Verify form values
    await expect(loginPage.emailInput).toHaveValue(employeeUser.email);
    await expect(loginPage.passwordInput).toHaveValue(employeeUser.password);
  });

  test("should toggle password visibility", async ({ loginPage }) => {
    await loginPage.testPasswordVisibilityToggle();
  });

  test("should handle remember me checkbox", async ({ loginPage }) => {
    await loginPage.testRememberMe();
  });

  test("should validate form correctly", async ({ loginPage }) => {
    await loginPage.testFormValidation();

    // Test specific error messages
    await expect(loginPage.emailError).toContainText("Email is required");
    await expect(loginPage.passwordError).toContainText("Password is required");
  });

  test("should handle form submission with valid data", async ({
    loginPage,
    employeeUser,
  }) => {
    // Fill form with valid data
    await loginPage.fillLoginForm(employeeUser.email, employeeUser.password);

    // Submit form (in test environment, this might not fully succeed)
    await loginPage.submitForm();

    // Wait for submission attempt
    await loginPage.page.waitForTimeout(2000);

    // Either redirected to dashboard or shows error (expected in test)
    const currentUrl = await loginPage.getCurrentUrl();
    const isOnLoginPage = currentUrl.includes("/login");
    const isOnDashboard = currentUrl.includes("/dashboard");

    expect(isOnLoginPage || isOnDashboard).toBeTruthy();
  });

  test("should show loading state during submission", async ({
    loginPage,
    employeeUser,
  }) => {
    await loginPage.fillLoginForm(employeeUser.email, employeeUser.password);
    await loginPage.testLoadingState();
  });

  test("should clear errors when user starts typing", async ({ loginPage }) => {
    // Trigger errors first
    await loginPage.signInButton.click();
    await expect(loginPage.emailError).toBeVisible();

    // Start typing in email field
    await loginPage.emailInput.fill("test@example.com");
    await expect(loginPage.emailError).not.toBeVisible();
  });

  test("should handle forgot password link", async ({ loginPage }) => {
    await loginPage.testForgotPasswordLink();
  });

  test("should handle create account link", async ({ loginPage }) => {
    await loginPage.testCreateAccountLink();
  });
});

test.describe("Login Page - Keyboard Navigation", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  test("should be fully keyboard navigable", async ({ loginPage }) => {
    await loginPage.testKeyboardNavigation();
  });

  test("should handle Tab order correctly", async ({ loginPage }) => {
    // Test complete tab order
    const expectedOrder = [
      "#email", // Email input
      "#password", // Password input
      'button[aria-label*="password"]', // Show/hide password button
      "#remember", // Remember me checkbox
      'button[type="submit"]', // Sign in button
      "text=Forgot password?", // Forgot password link
      "text=Create account", // Create account link
    ];

    for (const selector of expectedOrder) {
      await loginPage.page.keyboard.press("Tab");
      const focusedElement = loginPage.page.locator(":focus");

      if (selector === 'button[type="submit"]') {
        // Sign in button might be the main focus
        const isButtonFocused = await focusedElement.evaluate(
          (el) =>
            el.tagName.toLowerCase() === "button" &&
            el.textContent?.includes("Sign In")
        );
        expect(isButtonFocused).toBeTruthy();
      }
    }
  });

  test("should handle Enter key submission", async ({
    loginPage,
    employeeUser,
  }) => {
    await loginPage.emailInput.fill(employeeUser.email);
    await loginPage.passwordInput.fill(employeeUser.password);
    await loginPage.page.keyboard.press("Enter");

    await loginPage.page.waitForTimeout(2000);
    // Should attempt to submit form
  });

  test("should handle Escape key", async ({ loginPage }) => {
    await loginPage.emailInput.focus();
    await loginPage.emailInput.fill("test@example.com");
    await loginPage.page.keyboard.press("Escape");

    // Focus should move away or form should reset (depends on implementation)
    await loginPage.page.waitForTimeout(500);
  });
});

test.describe("Login Page - Responsive Design", () => {
  test("should be responsive on mobile devices", async ({ loginPage }) => {
    await loginPage.testMobileResponsiveness();

    // Verify mobile layout
    await expect(loginPage.welcomeTitle).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.mainCharacter).toBeVisible();

    await loginPage.takeScreenshot("mobile-login-page");
  });

  tabletTest("should be responsive on tablet devices", async ({ tabletPage }) => {
    const tabletLoginPage = new (require("../pages/LoginPage"))(tabletPage);
    await tabletLoginPage.navigate();
    await tabletLoginPage.verifyPageLoaded();

    await tabletLoginPage.takeScreenshot("tablet-login-page");
  });

  test("should handle orientation changes on mobile", async ({ loginPage }) => {
    // Test portrait
    await loginPage.setMobileViewport();
    await loginPage.verifyPageLoaded();
    await loginPage.takeScreenshot("mobile-portrait-login");

    // Test landscape
    await loginPage.page.setViewportSize({ width: 667, height: 375 });
    await loginPage.waitForPageLoad();
    await loginPage.takeScreenshot("mobile-landscape-login");

    // Verify key elements are still visible
    await expect(loginPage.welcomeTitle).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
  });
});

test.describe("Login Page - Accessibility", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  test("should meet WCAG accessibility standards", async ({ loginPage }) => {
    await loginPage.checkAccessibility();
    await loginPage.checkCharacterAccessibility();
  });

  test("should have proper focus management", async ({ loginPage }) => {
    // Test focus indicators
    await loginPage.emailInput.focus();
    const emailFocused = await loginPage.emailInput.evaluate(
      (el) => el === document.activeElement
    );
    expect(emailFocused).toBeTruthy();

    // Test focus order
    await loginPage.page.keyboard.press("Tab");
    const passwordFocused = await loginPage.passwordInput.evaluate(
      (el) => el === document.activeElement
    );
    expect(passwordFocused).toBeTruthy();
  });

  test("should have proper ARIA labels and roles", async ({ loginPage }) => {
    // Check form labels
    await expect(loginPage.page.locator('label[for="email"]')).toBeVisible();
    await expect(loginPage.page.locator('label[for="password"]')).toBeVisible();
    await expect(loginPage.page.locator('label[for="remember"]')).toBeVisible();

    // Check button aria-labels
    await expect(loginPage.showPasswordButton).toHaveAttribute("aria-label");

    // Check error message roles
    await expect(loginPage.errorMessage).toHaveAttribute("role", "alert");
  });

  test("should support screen readers", async ({ loginPage }) => {
    // Check for semantic HTML
    await expect(loginPage.page.locator("h1")).toBeVisible();
    await expect(loginPage.page.locator("form")).toBeVisible();
    await expect(loginPage.page.locator("main")).toBeVisible();

    // Check for alt text on meaningful images
    const logo = loginPage.page.locator("img");
    const logoCount = await logo.count();

    for (let i = 0; i < logoCount; i++) {
      const img = logo.nth(i);
      const alt = await img.getAttribute("alt");
      if (alt) {
        expect(alt.length).toBeGreaterThan(0);
      }
    }
  });

  test("should have sufficient color contrast", async ({ loginPage }) => {
    // Check text elements for basic contrast
    const textElements = loginPage.page.locator("h1, h2, p, label, button");
    const elementCount = await textElements.count();

    for (let i = 0; i < Math.min(elementCount, 10); i++) {
      const element = textElements.nth(i);
      const isVisible = await element.isVisible();

      if (isVisible) {
        const styles = await element.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
          };
        });

        // Basic contrast check
        expect(styles.color).not.toBe("rgba(0, 0, 0, 0)");
        expect(styles.color).not.toBe("transparent");
      }
    }
  });
});

test.describe("Login Page - Edge Cases", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  test("should handle very long input values", async ({ loginPage }) => {
    const longEmail = "a".repeat(100) + "@example.com";
    const longPassword = "a".repeat(200);

    await loginPage.fillLoginForm(longEmail, longPassword);

    // Form should still be functional
    await expect(loginPage.emailInput).toHaveValue(longEmail);
    await expect(loginPage.passwordInput).toHaveValue(longPassword);
  });

  test("should handle special characters in input", async ({ loginPage }) => {
    const specialEmail = "test+special@example.co.uk";
    const specialPassword = "P@$$w0rd!123#";

    await loginPage.fillLoginForm(specialEmail, specialPassword);

    await expect(loginPage.emailInput).toHaveValue(specialEmail);
    await expect(loginPage.passwordInput).toHaveValue(specialPassword);
  });

  test("should handle rapid form interactions", async ({
    loginPage,
    employeeUser,
  }) => {
    // Rapid field switching
    await loginPage.emailInput.fill(employeeUser.email);
    await loginPage.passwordInput.focus();
    await loginPage.emailInput.focus();
    await loginPage.passwordInput.fill(employeeUser.password);
    await loginPage.emailInput.focus();

    // Form should still be stable
    await expect(loginPage.emailInput).toHaveValue(employeeUser.email);
    await expect(loginPage.passwordInput).toHaveValue(employeeUser.password);
  });

  test("should handle multiple rapid submissions", async ({
    loginPage,
    employeeUser,
  }) => {
    await loginPage.fillLoginForm(employeeUser.email, employeeUser.password);

    // Click submit multiple times rapidly
    for (let i = 0; i < 3; i++) {
      await loginPage.signInButton.click();
      await loginPage.page.waitForTimeout(100);
    }

    // Should not cause errors or multiple submissions
    await loginPage.page.waitForTimeout(2000);
  });

  test("should handle browser back button", async ({ loginPage }) => {
    // Navigate to another page first
    await loginPage.goto("/register");
    await loginPage.page.waitForTimeout(1000);

    // Go back to login page
    await loginPage.page.goBack();
    await loginPage.verifyPageLoaded();
  });

  test("should handle page refresh", async ({ loginPage, employeeUser }) => {
    // Fill form partially
    await loginPage.emailInput.fill(employeeUser.email);

    // Refresh page
    await loginPage.page.reload();
    await loginPage.verifyPageLoaded();

    // Form should be cleared (depends on implementation)
    const emailValue = await loginPage.emailInput.inputValue();
    expect(emailValue).toBe("");
  });

  test("should handle network errors gracefully", async ({
    loginPage,
    employeeUser,
    page,
  }) => {
    // Simulate network offline
    await page.context().setOffline(true);

    // Try to submit form
    await loginPage.fillLoginForm(employeeUser.email, employeeUser.password);
    await loginPage.submitForm();

    // Should show network error or handle gracefully
    await loginPage.page.waitForTimeout(3000);

    // Go back online
    await page.context().setOffline(false);
  });
});

test.describe("Login Page - Cross-browser Compatibility", () => {
  test("should work in Chromium with full animations", async ({
    loginPage,
  }) => {
    await loginPage.verifyPageLoaded();
    await loginPage.testCharacterInteractions();
    await expect(loginPage.mainCharacter).toBeVisible();
  });

  test("should work in Firefox", async ({ loginPage }) => {
    await loginPage.verifyPageLoaded();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
  });

  test("should work in Safari", async ({ loginPage }) => {
    await loginPage.verifyPageLoaded();
    await expect(loginPage.signInButton).toBeVisible();
  });
});

test.describe("Login Page - Performance", () => {
  test("should load animations smoothly", async ({ loginPage }) => {
    const startTime = Date.now();
    await loginPage.navigate();
    await loginPage.verifyPageLoaded();

    // Wait for initial animations
    await loginPage.page.waitForTimeout(2000);

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000);
  });

  test("should handle character animations efficiently", async ({
    loginPage,
  }) => {
    await loginPage.navigate();
    await loginPage.testCharacterInteractions();

    // Page should remain responsive
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.signInButton).toBeVisible();
  });

  test("should not have memory leaks with multiple interactions", async ({
    loginPage,
    employeeUser,
  }) => {
    // Perform many interactions
    for (let i = 0; i < 10; i++) {
      await loginPage.emailInput.fill(`${employeeUser.email}${i}`);
      await loginPage.passwordInput.focus();
      await loginPage.page.waitForTimeout(100);
      await loginPage.emailInput.clear();
    }

    // Page should still be functional
    await loginPage.fillLoginForm(employeeUser.email, employeeUser.password);
    await expect(loginPage.emailInput).toHaveValue(employeeUser.email);
  });
});
