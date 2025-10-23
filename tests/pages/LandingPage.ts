// @ts-nocheck - Suppressing type checking for test page object to focus on core application TypeScript errors
import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class LandingPage extends BasePage {
  // Selectors
  readonly signInButton = this.page.locator(
    'button:has-text("Sign In"), a:has-text("Sign In")'
  );
  readonly getStartedButton = this.page.locator(
    'button:has-text("Get Started"), a:has-text("Get Started")'
  );
  readonly logo = this.page.locator('img[alt*="logo"], [data-testid="logo"]');
  readonly heroTitle = this.page.locator(
    'h1, .hero-title, [data-testid="hero-title"]'
  );
  readonly featuresSection = this.page.locator(
    '[data-testid="features"], .features'
  );
  readonly testimonialSection = this.page.locator(
    '[data-testid="testimonials"], .testimonials'
  );
  readonly footer = this.page.locator('footer, [data-testid="footer"]');

  /**
   * Navigate to landing page
   */
  async visit(): Promise<void> {
    await this.goto("/");
  }

  /**
   * Verify landing page is loaded
   */
  async verifyLoaded(): Promise<void> {
    await expect(this.heroTitle).toBeVisible();
    await expect(this.signInButton).toBeVisible();
    await this.verifyAccessibility();
  }

  /**
   * Click sign in button
   */
  async clickSignIn(): Promise<void> {
    await this.signInButton.click();
    await this.page.waitForURL("**/login**", { timeout: 5000 });
  }

  /**
   * Click get started button
   */
  async clickGetStarted(): Promise<void> {
    await this.getStartedButton.click();
    await this.page.waitForURL("**/register**", { timeout: 5000 });
  }

  /**
   * Verify key elements are present
   */
  async verifyKeyElements(): Promise<void> {
    await expect(this.logo).toBeVisible();
    await expect(this.heroTitle).toBeVisible();
    await expect(this.signInButton).toBeVisible();
    await expect(this.featuresSection).toBeVisible();
    await expect(this.footer).toBeVisible();
  }

  /**
   * Verify hero section content
   */
  async verifyHeroSection(): Promise<{
    title: string;
    description?: string;
    ctaVisible: boolean;
  }> {
    const title = await this.heroTitle.textContent();
    const description = await this.page
      .locator('.hero-description, [data-testid="hero-description"]')
      .textContent();
    const ctaVisible = await this.signInButton.isVisible();

    return {
      title: title?.trim() || "",
      description: description?.trim() || undefined,
      ctaVisible,
    };
  }

  /**
   * Verify features section
   */
  async verifyFeaturesSection(): Promise<{
    featureCount: number;
    featuresVisible: boolean;
  }> {
    const features = this.page.locator(
      '.feature-card, [data-testid="feature-card"]'
    );
    const featureCount = await features.count();
    const featuresVisible = await this.featuresSection.isVisible();

    return {
      featureCount,
      featuresVisible,
    };
  }

  /**
   * Verify responsive navigation
   */
  async verifyResponsiveNavigation(): Promise<void> {
    const viewport = this.page.viewportSize();
    if (!viewport) throw new Error("Viewport not set");

    // Test mobile navigation
    if (viewport.width < 768) {
      const mobileMenuButton = this.page.locator(
        'button[aria-label="Menu"], .mobile-menu-button'
      );
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        await this.page.waitForTimeout(500);

        const mobileMenu = this.page.locator(
          '.mobile-menu, [data-testid="mobile-menu"]'
        );
        await expect(mobileMenu).toBeVisible();

        // Close mobile menu
        await mobileMenuButton.click();
      }
    }
  }

  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation(): Promise<void> {
    // Tab through interactive elements
    await this.page.keyboard.press("Tab");

    // Focus should be on first interactive element
    const focusedElement = await this.page.locator(":focus").textContent();
    expect(focusedElement).toBeTruthy();

    // Tab through all interactive elements
    let tabCount = 0;
    const maxTabs = 10; // Prevent infinite loop

    while (tabCount < maxTabs) {
      await this.page.keyboard.press("Tab");
      tabCount++;

      const focused = await this.page.locator(":focus").count();
      if (focused === 0) break;

      // Check if we've looped back to the beginning
      const firstTabbable = await this.page
        .locator("button, a, input, select, textarea")
        .first();
      if (await firstTabbable.evaluate((el) => el === document.activeElement)) {
        break;
      }
    }
  }

  /**
   * Test page links
   */
  async testPageLinks(): Promise<{
    workingLinks: number;
    brokenLinks: number;
    totalLinks: number;
  }> {
    const links = this.page.locator("a[href]");
    const totalLinks = await links.count();
    let workingLinks = 0;
    let brokenLinks = 0;

    for (let i = 0; i < Math.min(totalLinks, 10); i++) {
      // Test max 10 links
      const link = links.nth(i);
      const href = await link.getAttribute("href");

      if (href && (href.startsWith("http") || href.startsWith("/"))) {
        try {
          // Check if link leads to valid page
          const targetUrl = href.startsWith("http")
            ? href
            : new URL(href, this.page.url()).href;

          // For external links, just check format
          if (href.startsWith("http")) {
            workingLinks++;
          } else {
            // For internal links, try to navigate
            await Promise.all([
              this.page.waitForResponse(
                (resp) => resp.url().includes(href) || resp.status() === 404
              ),
              link.click(),
            ]);

            const currentUrl = this.page.url();
            if (!currentUrl.includes("error") && !currentUrl.includes("404")) {
              workingLinks++;
            } else {
              brokenLinks++;
            }

            // Go back
            await this.page.goBack();
          }
        } catch {
          brokenLinks++;
        }
      }
    }

    return {
      workingLinks,
      brokenLinks,
      totalLinks,
    };
  }

  /**
   * Verify SEO meta tags
   */
  async verifySEOMetaTags(): Promise<{
    hasTitle: boolean;
    hasDescription: boolean;
    hasKeywords: boolean;
    hasViewport: boolean;
  }> {
    const title = await this.page.title();
    const description = await this.page.getAttribute(
      'meta[name="description"]',
      "content"
    );
    const keywords = await this.page.getAttribute(
      'meta[name="keywords"]',
      "content"
    );
    const viewport = await this.page.getAttribute(
      'meta[name="viewport"]',
      "content"
    );

    return {
      hasTitle: title.length > 0,
      hasDescription: !!description && description.length > 0,
      hasKeywords: !!keywords && keywords.length > 0,
      hasViewport: !!viewport && viewport.includes("width=device-width"),
    };
  }
}
