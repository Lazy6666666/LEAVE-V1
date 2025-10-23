const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/__tests__/jest.setup.ts"],
  testEnvironment: "jsdom",
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/__tests__/e2e/",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@supabase/(.*)$": "<rootDir>/node_modules/@supabase/$1",
  },
  collectCoverageFrom: [
    "components/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "app/**/*.{js,jsx,ts,tsx}",
    "types/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/*.config.*",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/coverage/**",
    "!__tests__/**",
    "!tests/**",
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  coverageReporters: ["text", "lcov", "html", "json"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  testMatch: [
    "<rootDir>/__tests__/**/*.(test|spec).(ts|tsx|js|jsx)",
    "<rootDir>/tests/**/*.(test|spec).(ts|tsx|js|jsx)",
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
