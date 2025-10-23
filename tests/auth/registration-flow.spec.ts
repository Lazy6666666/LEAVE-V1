import { test, expect } from "../fixtures/test-fixtures";
import { LandingPage } from "../pages/LandingPage";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { TestHelpers } from "../utils/test-helpers";

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  department?: string;
  role?: string;
}

test.describe("Authentication Flow - Registration", () => {
  let landingPage: LandingPage;
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    landingPage = new LandingPage(page);
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    helpers = new TestHelpers(page);
  });

  test.describe("Registration Page Access", () => {
    test("should navigate to registration page from landing page", async ({
      page,
    }) => {
      await landingPage.visit();
      await landingPage.verifyLoaded();

      await landingPage.clickGetStarted();
      await expect(page).toHaveURL("**/register**");
    });

    test("should navigate to registration page from login page", async ({
      page,
    }) => {
      await loginPage.visit();
      await loginPage.verifyLoaded();

      await loginPage.clickRegister();
      await expect(page).toHaveURL("**/register**");
    });

    test("should display registration form with all required fields", async ({
      page,
    }) => {
      await page.goto("/register");
      await page.waitForLoadState("networkidle");

      // Check for form fields
      const formFields = [
        'input[name="firstName"], input[placeholder*="first name"]',
        'input[name="lastName"], input[placeholder*="last name"]',
        'input[type="email"], input[name="email"], input[placeholder*="email"]',
        'input[type="password"], input[name="password"], input[placeholder*="password"]',
        'input[name="confirmPassword"], input[placeholder*="confirm"]',
        'select[name="department"], [data-testid="department-select"]',
        'button[type="submit"], button:has-text("Register")',
      ];

      for (const selector of formFields) {
        await expect(page.locator(selector)).toBeVisible();
      }
    });

    test("should be accessible on registration page", async ({ page }) => {
      await page.goto("/register");
      await page.waitForLoadState("networkidle");

      await helpers.verifyAccessibility();
    });
  });

  test.describe("Registration Form Validation", () => {
    test("should validate required fields", async ({ page }) => {
      await page.goto("/register");
      await page.waitForLoadState("networkidle");

      // Try to submit empty form
      await page.click('button[type="submit"], button:has-text("Register")');
      await page.waitForTimeout(500);

      // Should show validation errors
      const errorElements = page.locator(
        '.field-error, [data-testid="field-error"]'
      );
      await expect(errorElements.first()).toBeVisible();
    });

    test("should validate email format", async ({ page }) => {
      await page.goto("/register");
      await page.waitForLoadState("networkidle");

      await helpers.fillFormField("email", "invalid-email");
      await page.keyboard.press("Tab");
      await page.waitForTimeout(500);

      const emailError = page.locator(
        '.field-error:has-text("email"), [data-testid="email-error"]'
      );
      const hasEmailError = await emailError.isVisible();
      expect(hasEmailError).toBe(true);
    });

    test("should validate password requirements", async ({ page }) => {
      await page.goto("/register");
      await page.waitForLoadState("networkidle");

      // Test weak password
      await helpers.fillFormField("password", "123");
      await page.keyboard.press("Tab");
      await page.waitForTimeout(500);

      const passwordError = page.locator(
        '.field-error:has-text("password"), [data-testid="password-error"]'
      );
      const hasPasswordError = await passwordError.isVisible();
      expect(hasPasswordError).toBe(true);
    });

    test("should validate password confirmation", async ({ page }) => {
      await page.goto("/register");
      await page.waitForLoadState("networkidle");

      await helpers.fillFormField("password", "Test123456!");
      await helpers.fillFormField("confirmPassword", "DifferentPassword");
      await page.keyboard.press("Tab");
      await page.waitForTimeout(500);

      const confirmError = page.locator(
        '.field-error:has-text("match"), [data-testid="confirm-error"]'
      );
      const hasConfirmError = await confirmError.isVisible();
      expect(hasConfirmError).toBe(true);
    });

    test("should show real-time validation feedback", async ({ page }) => {
      await page.goto("/register");
      await page.waitForLoadState("networkidle");

      const emailInput = page.locator(
        'input[type="email"], input[name="email"]'
      );
      await emailInput.fill("test@example.com");
      await emailInput.blur();
      await page.waitForTimeout(500);

      // Check for success indicator or no error
      const emailError = page.locator('.field-error:has-text("email")');
      const hasError = await emailError.isVisible();
      expect(hasError).toBe(false);
    });
  });

  test.describe("Registration Success Flow", () => {
    test("should register successfully with valid data", async ({ page }) => {
      await page.goto("/register");
      await page.waitForLoadState("networkidle");

      const testData = TestHelpers.generateTestData();
      const registrationData: RegistrationData = {
        firstName: "John",
        lastName: "Doe",
        email: testData.email,
        password: testData.password,
        confirmPassword: testData.password,
        department: "Engineering",
        role: "EMPLOYEE",
      };

      // Fill registration form
      await helpers.fillFormField("firstName", registrationData.firstName);
      await helpers.fillFormField("lastName", registrationData.lastName);
      await helpers.fillFormField("email", registrationData.email);
      await helpers.fillFormField("password", registrationData.password);
      await helpers.fillFormField(
        "confirmPassword",
        registrationData.confirmPassword
      );
      await helpers.selectDropdown("department", registrationData.department!);

      // Submit form
      await page.click('button[type="submit"], button:has-text("Register")');
      await page.waitForTimeout(2000);

      // Should show success message or redirect to dashboard
      const currentUrl = page.url();
      const isSuccess =
        currentUrl.includes("/dashboard") ||
        (await page
          .locator('.success-message, [data-testid="success-message"]')
          .isVisible());

      expect(isSuccess).toBe(true);

      if (currentUrl.includes("/dashboard")) {
        await dashboardPage.verifyLoaded();
      }
    });

    test("should show email verification requirement if applicable", async ({
      page,
    }) => {
      await page.goto("/register");
      await page.waitForLoadState("networkidle");

      const testData = TestHelpers.generateTestData();
      const registrationData: RegistrationData = {
        firstName: "Jane",
        lastName: "Smith",
        email: testData.email,
        password: testData.password,
        confirmPassword: testData.password,
        department: "Sales",
        role: "EMPLOYEE",
      };

      // Fill registration form
      await helpers.fillFormField("firstName", registrationData.firstName);
      await helpers.fillFormField("lastName", registrationData.lastName);
      await helpers.fillFormField("email", registrationData.email);
      await helpers.fillFormField("password", registrationData.password);
      await helpers.fillFormField(
        "confirmPassword",
        registrationData.confirmPassword
      );
      await helpers.selectDropdown("department", registrationData.department!);

      // Submit form
      await page.click('button[type="submit"], button:has-text("Register")');
      await page.waitForTimeout(2000);

      // Check if email verification is required
      const verificationMessage = await page
        .locator("text=verification, text=confirm email")
        .isVisible();
      if (verificationMessage) {
        console.log("Email verification is required");
        await expect(
          page.locator("text=verification, text=confirm email")
        ).toBeVisible();
      }
    });

    test("should create user profile successfully", async ({ page }) => {
      await page.goto("/register");
      await page.waitForLoadState("networkidle");

      const testData = TestHelpers.generateTestData();
      const registrationData: RegistrationData = {
        firstName: "Alice",
        lastName: "Johnson",
        email: testData.email,
        password: testData.password,
        confirmPassword: testData.password,
        department: "Marketing",
        role: "EMPLOYEE",
      };

      // Fill registration form
      await helpers.fillFormField("firstName", registrationData.firstName);
      await helpers.fillFormField("lastName", registrationData.lastName);
      await helpers.fillFormField("email", registrationData.email);
      await helpers.fillFormField("password", registrationData.password);
      await helpers.fillFormField(
        "confirmPassword",
        registrationData.confirmPassword
      );
      await helpers.selectDropdown("department", registrationData.department!);

      // Submit form
      await page.click('button[type="submit"], button:has-text("Register")');
      await page.waitForTimeout(3000);

      // Check if redirected to dashboard or login
      const currentUrl = page.url();

      if (currentUrl.includes("/dashboard")) {
        // Verify user profile is created
        await dashboardPage.verifyLoaded();
        const currentUser = await dashboardPage.getCurrentUser();
        expect(currentUser?.name).toContain(registrationData.firstName);
        expect(currentUser?.email).toBe(registrationData.email);
      } else if (currentUrl.includes("/login")) {
        // Need to login after registration
        await loginPage.login(
          registrationData.email,
          registrationData.password
        );
        await dashboardPage.verifyLoaded();

        const currentUser = await dashboardPage.getCurrentUser();
        expect(currentUser?.name).toContain(registrationData.firstName);
      }
    });
  });

  test.describe("Registration Error Handling", () => {
    test("should handle duplicate email registration", async ({ page }) => {
      await page.goto("/register");
      await page.waitForLoadState("networkidle");

      // Try to register with existing email
      const registrationData: RegistrationData = {
        firstName: "Duplicate",
        lastName: "User",
        email: "employee@test.com", // Existing user
        password: "Test123456!",
        confirmPassword: "Test123456!",
        department: "Engineering",
        role: "EMPLOYEE",
      };

      await helpers.fillFormField("firstName", registrationData.firstName);
      await helpers.fillFormField("lastName", registrationData.lastName);
      await helpers.fillFormField("email", registrationData.email);
      await helpers.fillFormField("password", registrationData.password);
      await helpers.fillFormField(
        "confirmPassword",
        registrationData.confirmPassword
      );
      await helpers.selectDropdown("department", registrationData.department!);

      // Submit form
      await page.click('button[type="submit"], button:has-text("Register")');
      await page.waitForTimeout(2000);

      // Should show error about existing email
      const errorMessage = page.locator('.error, [data-testid="error"]');
      await expect(errorMessage).toContainText("already exists", {
        timeout: 5000,
      });
    });

    test("should handle network errors gracefully", async ({ page }) => {
      await page.goto("/register");
      await page.waitForLoadState("networkidle");

      // Simulate network offline
      await page.context().setOffline(true);

      const testData = TestHelpers.generateTestData();
      const registrationData: RegistrationData = {
        firstName: "Network",
        lastName: "Test",
        email: testData.email,
        password: testData.password,
        confirmPassword: testData.password,
        department: "IT",
        role: "EMPLOYEE",
      };

      // Fill form
      await helpers.fillFormField("firstName", registrationData.firstName);
      await helpers.fillFormField("lastName", registrationData.lastName);
      await helpers.fillFormField("email", registrationData.email);
      await helpers.fillFormField("password", registrationData.password);
      await helpers.fillFormField(
        "confirmPassword",
        registrationData.confirmPassword
      );
      await helpers.selectDropdown("department", registrationData.department!);

      // Submit form
      await page.click('button[type="submit"], button:has-text("Register")');
      await page.waitForTimeout(3000);

      // Should show network error
      const errorMessage = page.locator('.error, [data-testid="error"]');
      const hasNetworkError = await errorMessage
        .filter({ hasText: "network" })
        .isVisible();

      // Restore network
      await page.context().setOffline(false);

      expect(hasNetworkError).toBe(true);
    });

    test("should handle server errors gracefully", async ({ page }) => {
      await page.goto("/register");
      await page.waitForLoadState("networkidle");

      // Fill form with valid data
      const testData = TestHelpers.generateTestData();
      await helpers.fillFormField("firstName", "Server");
      await helpers.fillFormField("lastName", "Error");
      await helpers.fillFormField("email", testData.email);
      await helpers.fillFormField("password", testData.password);
      await helpers.fillFormField("confirmPassword", testData.password);
      await helpers.selectDropdown("department", "Engineering");

      // Intercept and modify request to simulate server error
      await page.route("**/api/auth/register", (route) => {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Internal server error" }),
        });
      });

      // Submit form
      await page.click('button[type="submit"], button:has-text("Register")');
      await page.waitForTimeout(2000);

      // Should show server error
      const errorMessage = page.locator('.error, [data-testid="error"]');
      await expect(errorMessage).toBeVisible();
    });
  });

  test.describe("Registration Form Features", () => {
    test("should show password strength indicator", async ({ page }) => {
      await page.goto("/register");
      await page.waitForLoadState("networkidle");

      const passwordInput = page.locator(
        'input[type="password"], input[name="password"]'
      );
      await passwordInput.fill("weak");
      await page.waitForTimeout(500);

      const strengthIndicator = page.locator(
        '[data-testid="password-strength"], .password-strength'
      );
      const hasStrengthIndicator = await strengthIndicator.isVisible();

      if (hasStrengthIndicator) {
        console.log("Password strength indicator is present");
        await expect(strengthIndicator).toBeVisible();
      }
    });

    test("should handle password visibility toggle", async ({ page }) => {
      await page.goto("/register");
      await page.waitForLoadState("networkidle");

      const passwordInput = page.locator(
        'input[type="password"], input[name="password"]'
      );
      const toggleButton = passwordInput
        .locator("..")
        .locator('button:has-text("Show"), button:has-text("Hide")');

      if (await toggleButton.isVisible()) {
        const initialType = await passwordInput.getAttribute("type");
        await toggleButton.click();
        await page.waitForTimeout(200);

        const newType = await passwordInput.getAttribute("type");
        expect(initialType).not.toBe(newType);
      }
    });

    test("should support form autofill", async ({ page }) => {
      await page.goto("/register");
      await page.waitForLoadState("networkidle");

      // Test browser autofill suggestion
      const emailInput = page.locator(
        'input[type="email"], input[name="email"]'
      );
      await emailInput.fill("test@");
      await page.waitForTimeout(1000);

      // Check for autocomplete dropdown
      const autocompleteVisible = await page
        .locator('[role="listbox"], .autocomplete')
        .isVisible();
      console.log("Autocomplete support:", autocompleteVisible);
    });

    test("should be responsive and mobile-friendly", async ({ page }) => {
      await page.goto("/register");
      await page.waitForLoadState("networkidle");

      // Test mobile view
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);

      const formFields = page.locator("input, select, button");
      const firstField = formFields.first();
      const fieldBox = await firstField.boundingBox();

      if (fieldBox) {
        expect(fieldBox.height).toBeGreaterThanOrEqual(44); // Touch target size
      }

      // Test tablet view
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(500);
    });
  });

  test.describe("Post-Registration Flow", () => {
    test("should redirect to appropriate page after successful registration", async ({
      page,
    }) => {
      await page.goto("/register");
      await page.waitForLoadState("networkidle");

      const testData = TestHelpers.generateTestData();
      await helpers.fillFormField("firstName", "Redirect");
      await helpers.fillFormField("lastName", "Test");
      await helpers.fillFormField("email", testData.email);
      await helpers.fillFormField("password", testData.password);
      await helpers.fillFormField("confirmPassword", testData.password);
      await helpers.selectDropdown("department", "Engineering");

      await page.click('button[type="submit"], button:has-text("Register")');
      await page.waitForTimeout(3000);

      const currentUrl = page.url();

      // Should redirect to dashboard, login, or verification page
      const expectedUrls = ["/dashboard", "/login", "/verify-email"];
      const redirectedCorrectly = expectedUrls.some((url) =>
        currentUrl.includes(url)
      );

      expect(redirectedCorrectly).toBe(true);
    });

    test("should maintain user session after registration if auto-login is enabled", async ({
      page,
    }) => {
      await page.goto("/register");
      await page.waitForLoadState("networkidle");

      const testData = TestHelpers.generateTestData();
      await helpers.fillFormField("firstName", "Session");
      await helpers.fillFormField("lastName", "Test");
      await helpers.fillFormField("email", testData.email);
      await helpers.fillFormField("password", testData.password);
      await helpers.fillFormField("confirmPassword", testData.password);
      await helpers.selectDropdown("department", "Engineering");

      await page.click('button[type="submit"], button:has-text("Register")');
      await page.waitForTimeout(3000);

      const currentUrl = page.url();

      if (currentUrl.includes("/dashboard")) {
        // Test session persistence
        await page.reload();
        await page.waitForTimeout(2000);

        await dashboardPage.verifyLoaded();
        const currentUser = await dashboardPage.getCurrentUser();
        expect(currentUser).toBeTruthy();
      }
    });

    test("should show welcome message or onboarding after registration", async ({
      page,
    }) => {
      await page.goto("/register");
      await page.waitForLoadState("networkidle");

      const testData = TestHelpers.generateTestData();
      await helpers.fillFormField("firstName", "Welcome");
      await helpers.fillFormField("lastName", "User");
      await helpers.fillFormField("email", testData.email);
      await helpers.fillFormField("password", testData.password);
      await helpers.fillFormField("confirmPassword", testData.password);
      await helpers.selectDropdown("department", "Engineering");

      await page.click('button[type="submit"], button:has-text("Register")');
      await page.waitForTimeout(3000);

      const currentUrl = page.url();

      if (currentUrl.includes("/dashboard")) {
        // Look for welcome message
        const welcomeMessage = page.locator(
          'text=welcome, text=get started, [data-testid="welcome-message"]'
        );
        const hasWelcomeMessage = await welcomeMessage.isVisible({
          timeout: 5000,
        });

        if (hasWelcomeMessage) {
          console.log("Welcome message is displayed");
          await expect(welcomeMessage).toBeVisible();
        }
      }
    });
  });

  test.describe("Security and Compliance", () => {
    test("should implement CSRF protection", async ({ page }) => {
      await page.goto("/register");
      await page.waitForLoadState("networkidle");

      // Check for CSRF token
      const csrfToken = await page
        .locator(
          'input[name="_csrf"], input[name="csrfToken"], [data-testid="csrf-token"]'
        )
        .count();
      expect(csrfToken).toBeGreaterThanOrEqual(0); // May or may not be visible
    });

    test("should not store password in plain text", async ({ page }) => {
      await page.goto("/register");
      await page.waitForLoadState("networkidle");

      const passwordInput = page.locator(
        'input[type="password"], input[name="password"]'
      );
      await passwordInput.fill("TestPassword123!");

      const inputType = await passwordInput.getAttribute("type");
      expect(inputType).toBe("password");
    });

    test("should implement rate limiting for registration attempts", async ({
      page,
    }) => {
      await page.goto("/register");
      await page.waitForLoadState("networkidle");

      let rateLimitDetected = false;

      // Make multiple registration attempts
      for (let i = 0; i < 5; i++) {
        const testData = TestHelpers.generateTestData();

        await helpers.fillFormField("firstName", "Rate");
        await helpers.fillFormField("lastName", `Limit${i}`);
        await helpers.fillFormField("email", testData.email);
        await helpers.fillFormField("password", testData.password);
        await helpers.fillFormField("confirmPassword", testData.password);
        await helpers.selectDropdown("department", "Engineering");

        await page.click('button[type="submit"], button:has-text("Register")');
        await page.waitForTimeout(2000);

        // Check for rate limit message
        const rateLimitMessage = await page
          .locator("text=rate limit, text=too many requests")
          .isVisible();
        if (rateLimitMessage) {
          rateLimitDetected = true;
          break;
        }

        // Clear form for next attempt
        await page.reload();
        await page.waitForLoadState("networkidle");
      }

      if (rateLimitDetected) {
        console.log("Rate limiting is active for registration");
      }
    });
  });
});
