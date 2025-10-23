# Critical QA Issues Solutions for Next.js 14 + TypeScript

## 1. Vitest/Jest Configuration Resolution

### Recommendation: Use Vitest as Primary Test Runner

**Why Vitest over Jest:**

- Native ESM support (solves your CommonJS conflicts)
- Faster execution with Vite
- Better TypeScript integration
- Compatible with Next.js 14 App Router
- Modern testing APIs

### Package Installation

```bash
# Remove Jest packages
npm uninstall jest @jest/globals @testing-library/jest-dom babel-jest jest-environment-jsdom jest-mock-extended

# Install additional Vitest packages
npm install -D vitest @vitest/ui @vitest/coverage-v8 jsdom @testing-library/jest-dom
```

### Updated vitest.config.ts

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./__tests__/vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "__tests__/",
        "tests/",
        "**/*.d.ts",
        "**/*.config.*",
        "coverage/",
        ".next/",
        "prisma/",
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    include: [
      "__tests__/**/*.{test,spec}.{js,ts,tsx}",
      "tests/**/*.{test,spec}.{js,ts,tsx}",
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.next/**",
      "**/coverage/**",
    ],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "test"),
  },
});
```

## 2. Missing Test Dependencies

### Required Packages Installation

```bash
# API route testing
npm install -D node-mocks-http @types/node-mocks-http

# Accessibility testing
npm install -D axe-playwright @axe-core/playwright

# Additional testing utilities
npm install -D @testing-library/user-event @testing-library/dom
```

### vitest.setup.ts

```typescript
import "@testing-library/jest-dom";
import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// Extend Vitest's expect
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock("next/router", () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: "/",
    query: {},
    asPath: "/",
    reload: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
    beforePopState: vi.fn(),
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
  }),
}));

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// Mock Supabase
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  })),
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
```

## 3. TypeScript Configuration Fixes

### Updated tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    },
    "forceConsistentCasingInFileNames": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "noImplicitAny": false,
    "noImplicitReturns": true,
    "noImplicitThis": true
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    "__tests__/**/*.ts",
    "__tests__/**/*.tsx",
    "tests/**/*.ts",
    "tests/**/*.tsx"
  ],
  "exclude": ["node_modules"],
  "ts-node": {
    "esm": true,
    "experimentalSpecifierResolution": "node"
  }
}
```

### Test-specific tsconfig.json (tsconfig.test.json)

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noImplicitAny": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "strict": false,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["__tests__/**/*", "tests/**/*"]
}
```

## 4. E2E Test Configuration Fix

### Updated playwright.config.ts

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html"],
    ["json", { outputFile: "playwright-report/results.json" }],
    ["junit", { outputFile: "playwright-report/results.xml" }],
  ],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
});
```

### Global Setup Fix (tests/e2e/global-setup.ts)

```typescript
import { chromium, FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Setup authentication or test data here if needed

  await browser.close();
}

export default globalSetup;
```

## 5. Updated Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch",

    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",

    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:headed": "playwright test --headed",

    "test:all": "npm run test:coverage && npm run test:e2e",
    "validate": "npm run type-check && npm run lint && npm run format:check",
    "validate:all": "npm run validate && npm run test:all",

    "db:setup": "prisma generate && prisma migrate dev && npm run db:seed",
    "db:reset": "prisma migrate reset --force && npm run db:seed",

    "analyze": "cross-env ANALYZE=true npm run build",
    "perf:build": "npm run build && npm run analyze"
  }
}
```

## 6. ESLint/Prettier Configuration

### .eslintrc.json (Updated)

```json
{
  "extends": ["next/core-web-vitals", "prettier"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars-experimental": "off",
    "prefer-const": "warn",
    "no-console": "warn",
    "react-hooks/exhaustive-deps": "warn",
    "react/no-unescaped-entities": "off"
  },
  "overrides": [
    {
      "files": [
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx"
      ],
      "rules": {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": "off"
      }
    }
  ]
}
```

### prettier.config.js

```javascript
/** @type {import('prettier').Config} */
module.exports = {
  semi: true,
  trailingComma: "es5",
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  endOfLine: "lf",
  arrowParens: "always",
  bracketSpacing: true,
  htmlWhitespaceSensitivity: "css",
  vueIndentScriptAndStyle: false,
  embeddedLanguageFormatting: "auto",
};
```

## 7. Implementation Steps

### Phase 1: Test Runner Migration

1. Remove Jest packages
2. Install Vitest packages
3. Update vitest.config.ts
4. Create vitest.setup.ts
5. Update test scripts in package.json

### Phase 2: Dependency Resolution

1. Install missing test dependencies
2. Fix TypeScript configuration
3. Update test setup files
4. Fix module resolution issues

### Phase 3: Code Quality Fixes

1. Run Prettier formatting: `npm run format`
2. Fix ESLint errors systematically
3. Update TypeScript configuration
4. Fix Playwright configuration

### Phase 4: Test Implementation

1. Fix existing failing tests
2. Add missing test utilities
3. Implement comprehensive test coverage
4. Set up CI/CD integration

## 8. Testing Best Practices for Next.js 14

### Unit Tests

- Use Vitest with jsdom environment
- Mock Next.js modules properly
- Test React components with Testing Library
- Test utility functions in isolation

### Integration Tests

- Test API routes with node-mocks-http
- Test database operations with mock Prisma client
- Test authentication flows
- Test component integration

### E2E Tests

- Use Playwright for user flow testing
- Test across multiple browsers
- Include accessibility testing with axe-playwright
- Test mobile responsiveness

### Coverage Requirements

- Target 80% coverage across all metrics
- Focus on business logic coverage
- Include test coverage for critical paths
- Monitor coverage in CI/CD pipeline

## 9. Troubleshooting Guide

### Common Issues:

1. **Vitest CommonJS conflicts**: Use dynamic imports or update module configuration
2. **TypeScript errors**: Update tsconfig.test.json for test-specific rules
3. **Playwright server startup**: Ensure port 3000 is available
4. **Coverage reporting**: Use v8 provider for accurate coverage

### Performance Optimization:

- Use test environment variables
- Implement test data factories
- Use test database for integration tests
- Implement test parallelization strategies

This comprehensive solution addresses all your critical QA issues with production-ready implementations that align with Next.js 14 best practices.
