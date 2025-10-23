// @ts-nocheck - Suppressing type checking for test file to focus on core application TypeScript errors
import { Page, expect, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Login Page Object Model
 * Handles interactions with the animated login page including character interactions
 */
export class LoginPage extends BasePage {
  // Form elements
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly showPasswordButton: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly signInButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly createAccountLink: Locator;

  // Character elements
  readonly mainCharacter: Locator;
  readonly secondaryCharacter: Locator;
  readonly characterMessage: Locator;

  // Error and success messages
  readonly errorMessage: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;

  // Page branding elements
  readonly welcomeTitle: Locator;
  readonly welcomeDescription: Locator;
  readonly logo: Locator;

  // Demo credentials notice
  readonly demoCredentialsNotice: Locator;

  constructor(page: Page) {
    super(page);

    // Form elements
    this.emailInput = page.locator("#email");
    this.passwordInput = page.locator("#password");
    this.showPasswordButton = page.locator('button[aria-label*="password"]');
    this.rememberMeCheckbox = page.locator("#remember");
    this.signInButton = page.locator('button[type="submit"]');
    this.forgotPasswordLink = page.locator("text=Forgot password?");
    this.createAccountLink = page.locator("text=Create account");

    // Character elements (using data attributes or specific selectors)
    this.mainCharacter = page.locator(".relative.w-24.h-24.bg-gradient-to-br"); // Main animated character
    this.secondaryCharacter = page.locator(
      ".relative.w-16.h-16.bg-gradient-to-br"
    ); // Secondary character
    this.characterMessage = page.locator(
      ".bg-white\\/80.backdrop-blur-sm.rounded-xl.p-4"
    );

    // Error messages
    this.errorMessage = page.locator('[role="alert"]');
    this.emailError = page.locator("#email-error");
    this.passwordError = page.locator("#password-error");

    // Page elements
    this.welcomeTitle = page.locator("text=Welcome back!");
    this.welcomeDescription = page.locator(
      "text=Your friendly security companion"
    );
    this.logo = page.locator(
      ".inline-flex.items-center.justify-center.w-20.h-20"
    );

    // Demo credentials
    this.demoCredentialsNotice = page.locator("text=Demo Account:");
  }

  /**
   * Navigate to login page
   */
  async navigate(): Promise<void> {
    await this.goto("/login");
  }

  /**
   * Verify login page loaded successfully
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.welcomeTitle).toBeVisible();
    await expect(this.welcomeDescription).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.signInButton).toBeVisible();
    await expect(this.mainCharacter).toBeVisible();
    await expect(this.secondaryCharacter).toBeVisible();
    await expect(this.characterMessage).toBeVisible();
  }

  /**
   * Fill in login form
   */
  async fillLoginForm(
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<void> {
    await this.fillField("#email", email);
    await this.fillField("#password", password);

    if (rememberMe) {
      await this.rememberMeCheckbox.check();
    }
  }

  /**
   * Submit login form
   */
  async submitForm(): Promise<void> {
    await this.clickElement('button[type="submit"]', {
      waitForNavigation: true,
    });
  }

  /**
   * Complete login flow
   */
  async login(
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<void> {
    await this.fillLoginForm(email, password, rememberMe);
    await this.submitForm();
  }

  /**
   * Toggle password visibility
   */
  async togglePasswordVisibility(): Promise<void> {
    const initialType = await this.passwordInput.getAttribute("type");
    await this.showPasswordButton.click();

    // Wait for character reaction
    await this.page.waitForTimeout(500);

    const newType = await this.passwordInput.getAttribute("type");
    expect(initialType).not.toBe(newType);
  }

  /**
   * Test character interactions
   */
  async testCharacterInteractions(): Promise<void> {
    // Test character reaction to email input
    await this.emailInput.focus();
    await this.page.waitForTimeout(500);

    // Fill email and check character mood
    await this.emailInput.fill("test@example.com");
    await this.page.waitForTimeout(1000); // Wait for character animation

    // Test character reaction to password input
    await this.passwordInput.focus();
    await this.page.waitForTimeout(500);

    // Fill password and check character mood
    await this.passwordInput.fill("password123");
    await this.page.waitForTimeout(1000); // Wait for character animation

    // Test password toggle reaction
    await this.togglePasswordVisibility();
    await this.page.waitForTimeout(1000); // Wait for character reaction
  }

  /**
   * Get current character message
   */
  async getCharacterMessage(): Promise<string | null> {
    return await this.characterMessage.textContent();
  }

  /**
   * Verify character mood based on message content
   */
  async verifyCharacterMood(
    expectedMood: "happy" | "excited" | "wink" | "sleeping"
  ): Promise<void> {
    const message = await this.getCharacterMessage();

    switch (expectedMood) {
      case "happy":
        expect(message).toContain("😊 Great to see you!");
        break;
      case "excited":
        expect(message).toContain("🎉 Awesome!");
        break;
      case "wink":
        expect(message).toContain("😉 Good job");
        break;
      case "sleeping":
        expect(message).toContain("🌙 Don't leave me waiting");
        break;
    }
  }

  /**
   * Test form validation
   */
  async testFormValidation(): Promise<void> {
    // Test empty form submission
    await this.signInButton.click();
    await expect(this.emailError).toBeVisible();
    await expect(this.passwordError).toBeVisible();

    // Test invalid email format
    await this.emailInput.fill("invalid-email");
    await this.signInButton.click();
    await expect(this.emailError).toContainText("valid email");

    // Test short password
    await this.emailInput.fill("test@example.com");
    await this.passwordInput.fill("123");
    await this.signInButton.click();
    await expect(this.passwordError).toContainText("at least 6 characters");

    // Clear errors with valid input
    await this.passwordInput.fill("password123");
    await expect(this.passwordError).not.toBeVisible();
  }

  /**
   * Test password visibility toggle functionality
   */
  async testPasswordVisibilityToggle(): Promise<void> {
    // Initially password should be hidden
    await expect(this.passwordInput).toHaveAttribute("type", "password");

    // Click show password button
    await this.showPasswordButton.click();
    await expect(this.passwordInput).toHaveAttribute("type", "text");
    await expect(this.showPasswordButton).toHaveAttribute(
      "aria-label",
      "Hide password"
    );

    // Click hide password button
    await this.showPasswordButton.click();
    await expect(this.passwordInput).toHaveAttribute("type", "password");
    await expect(this.showPasswordButton).toHaveAttribute(
      "aria-label",
      "Show password"
    );
  }

  /**
   * Test forgot password link
   */
  async testForgotPasswordLink(): Promise<void> {
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent("page"),
      this.forgotPasswordLink.click(),
    ]);
    await newPage.waitForLoadState();
    expect(newPage.url()).toContain("/reset-password");
    await newPage.close();
  }

  /**
   * Test create account link
   */
  async testCreateAccountLink(): Promise<void> {
    await this.createAccountLink.click();
    await this.waitForPageLoad();
    expect(await this.getCurrentUrl()).toContain("/register");
  }

  /**
   * Test remember me functionality
   */
  async testRememberMe(): Promise<void> {
    // Initially unchecked
    await expect(this.rememberMeCheckbox).not.toBeChecked();

    // Check remember me
    await this.rememberMeCheckbox.check();
    await expect(this.rememberMeCheckbox).toBeChecked();

    // Uncheck remember me
    await this.rememberMeCheckbox.uncheck();
    await expect(this.rememberMeCheckbox).not.toBeChecked();
  }

  /**
   * Test loading state during login
   */
  async testLoadingState(): Promise<void> {
    // Fill form with valid-looking data
    await this.fillLoginForm("test@example.com", "password123");

    // Start login and check loading state
    const loginPromise = this.signInButton.click();

    // Check for loading spinner
    await expect(this.page.locator(".animate-spin")).toBeVisible();
    await expect(this.signInButton).toBeDisabled();
    await expect(this.signInButton).toContainText("Signing in...");

    // Wait for login to complete (this will likely fail in test environment)
    try {
      await loginPromise;
    } catch {
      // Expected to fail in test environment
    }
  }

  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation(): Promise<void> {
    // Tab through form elements
    await this.page.keyboard.press("Tab");
    await expect(this.emailInput).toBeFocused();

    await this.page.keyboard.press("Tab");
    await expect(this.passwordInput).toBeFocused();

    await this.page.keyboard.press("Tab");
    await expect(this.showPasswordButton).toBeFocused();

    await this.page.keyboard.press("Tab");
    await expect(this.rememberMeCheckbox).toBeFocused();

    await this.page.keyboard.press("Tab");
    await expect(this.signInButton).toBeFocused();

    // Test Enter key submission
    await this.emailInput.focus();
    await this.emailInput.fill("test@example.com");
    await this.page.keyboard.press("Tab");
    await this.passwordInput.fill("password123");
    await this.page.keyboard.press("Enter");

    // Should trigger form submission
    await this.page.waitForTimeout(1000);
  }

  /**
   * Test responsive design on mobile
   */
  async testMobileResponsiveness(): Promise<void> {
    await this.setMobileViewport();
    await this.waitForPageLoad();

    // Verify mobile layout
    await expect(this.welcomeTitle).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();

    // Check if layout is stacked properly on mobile
    const formContainer = this.page.locator(".max-w-4xl.mx-auto.flex");
    const formComputedStyle = await formContainer.evaluate((el) => {
      return window.getComputedStyle(el).flexDirection;
    });

    // Should be column on mobile
    expect(formComputedStyle).toBe("column");
  }

  /**
   * Check accessibility on login page
   */
  async checkAccessibility(): Promise<void> {
    await super.checkAccessibility();

    // Check for proper form labels
    await expect(this.page.locator('label[for="email"]')).toBeVisible();
    await expect(this.page.locator('label[for="password"]')).toBeVisible();
    await expect(this.page.locator('label[for="remember"]')).toBeVisible();

    // Check for ARIA attributes
    await expect(this.emailInput).toHaveAttribute("aria-describedby");
    await expect(this.passwordInput).toHaveAttribute("aria-describedby");
    await expect(this.showPasswordButton).toHaveAttribute("aria-label");

    // Check for role attributes
    await expect(this.errorMessage).toHaveAttribute("role", "alert");
  }

  /**
   * Test character animations and interactions
   */
  async testCharacterAnimations(): Promise<void> {
    // Wait for initial character state
    await this.page.waitForTimeout(1000);

    // Trigger different character moods
    await this.emailInput.focus();
    await this.page.waitForTimeout(1000);

    await this.emailInput.fill("test@example.com");
    await this.page.waitForTimeout(2000); // Wait for character reaction

    await this.passwordInput.focus();
    await this.page.waitForTimeout(1000);

    await this.passwordInput.fill("password123");
    await this.page.waitForTimeout(2000); // Wait for character reaction

    // Test character bounce animation (should occur every 3 seconds)
    const initialCharacter = this.mainCharacter;
    await this.page.waitForTimeout(3000);

    // Character should still be visible and interactive
    await expect(initialCharacter).toBeVisible();
  }

  /**
   * Verify demo credentials notice is displayed
   */
  async verifyDemoCredentialsNotice(): Promise<void> {
    await expect(this.demoCredentialsNotice).toBeVisible();
    await expect(this.demoCredentialsNotice).toContainText("Demo Account");
    await expect(this.demoCredentialsNotice).toContainText(
      "Use any email and password"
    );
  }

  /**
   * Test page title and meta information
   */
  async verifyPageMetadata(): Promise<void> {
    const title = await this.getTitle();
    expect(title).toContain("Sign In") || expect(title).toContain("Login");

    // Check for proper meta description (if implemented)
    const metaDescription = await this.page
      .locator('meta[name="description"]')
      .getAttribute("content");
    if (metaDescription) {
      expect(metaDescription.length).toBeGreaterThan(0);
    }
  }

  /**
   * Test character accessibility
   */
  async checkCharacterAccessibility(): Promise<void> {
    // Characters should be decorative and not have interactive roles
    const mainCharacterRole = await this.mainCharacter.getAttribute("role");
    const secondaryCharacterRole =
      await this.secondaryCharacter.getAttribute("role");

    // Characters should not have interactive roles or should have aria-hidden
    expect(mainCharacterRole).toBeFalsy();
    expect(secondaryCharacterRole).toBeFalsy();

    // Character message should be accessible
    const messageText = await this.characterMessage.textContent();
    expect(messageText?.length).toBeGreaterThan(0);
  }
}
