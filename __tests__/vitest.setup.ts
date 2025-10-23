import "@testing-library/jest-dom";

// Load test environment variables
import { config } from "dotenv";

// Load .env.test for test environment first
const result = config({ path: ".env.test" });

if (result.error) {
  console.error("Error loading .env.test:", result.error);
  // Fallback to .env.local if .env.test fails
  const fallbackResult = config({ path: ".env.local" });
  if (fallbackResult.error) {
    console.error("Error loading .env.local as fallback:", fallbackResult.error);
  } else {
    console.log("Successfully loaded .env.local as fallback");
  }
} else {
  console.log("Successfully loaded .env.test");
  // Also load .env.local to override any missing values
  config({ path: ".env.local" });
}

// Validate required environment variables for tests
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.warn("Missing required environment variables:", missingVars);
  console.warn("Tests may fail due to missing database configuration");
}

// Set test-specific environment variables
process.env.NODE_ENV = 'test';
process.env.SKIP_EMAIL_NOTIFICATIONS = 'true';
process.env.SKIP_WEBHOOKS = 'true';
