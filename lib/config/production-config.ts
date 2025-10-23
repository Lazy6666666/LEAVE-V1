/**
 * Production Configuration
 *
 * Centralized production environment configuration
 * with security best practices and monitoring
 */

import { z } from "zod";

const productionConfigSchema = z.object({
  // Application
  NODE_ENV: z.enum(["production"]),
  DOMAIN: z.string().min(1),
  URL: z.string().url(),

  // Database
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),

  // Security
  NEXTAUTH_SECRET: z.string().min(32),
  CSRF_SECRET: z.string().min(32),
  SESSION_SECRET: z.string().min(32),

  // Email (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_SECURE: z.coerce.boolean().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  FROM_NAME: z.string().optional(),

  // File Storage (optional)
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),

  // Rate Limiting
  REDIS_URL: z.string().url().optional(),
  REDIS_PASSWORD: z.string().optional(),

  // Monitoring
  SENTRY_DSN: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),

  // Logging
  LOGTAIL_SOURCE_TOKEN: z.string().optional(),
  ELASTIC_APM_SECRET_TOKEN: z.string().optional(),

  // Security Features
  ENABLE_CSP: z.coerce.boolean().default(true),
  ENABLE_HSTS: z.coerce.boolean().default(true),
  ENABLE_RATE_LIMITING: z.coerce.boolean().default(true),
  ENABLE_CSRF_PROTECTION: z.coerce.boolean().default(true),

  // Features
  ENABLE_NOTIFICATIONS: z.coerce.boolean().default(true),
  ENABLE_FILE_UPLOADS: z.coerce.boolean().default(true),
  ENABLE_SEARCH: z.coerce.boolean().default(true),
  ENABLE_CALENDAR: z.coerce.boolean().default(true),
});

export type ProductionConfig = z.infer<typeof productionConfigSchema>;

/**
 * Validate and load production configuration
 */
export function getProductionConfig(): ProductionConfig {
  try {
    const config = productionConfigSchema.parse(process.env);
    return config;
  } catch (error) {
    console.error("Production configuration validation failed:", error);
    throw new Error("Invalid production configuration");
  }
}

/**
 * Database configuration for production
 */
export function getDatabaseConfig() {
  const config = getProductionConfig();

  return {
    url: config.DATABASE_URL,
    directUrl: config.DIRECT_URL,
    // Production database pool settings
    pool: {
      min: 5,
      max: 20,
      acquire: 30000,
      idle: 10000,
    },
  };
}

/**
 * Security configuration for production
 */
export function getSecurityConfig() {
  const config = getProductionConfig();

  return {
    nextAuth: {
      secret: config.NEXTAUTH_SECRET,
      session: {
        strategy: "jwt" as const,
        maxAge: 24 * 60 * 60, // 24 hours
      },
    },
    csrf: {
      secret: config.CSRF_SECRET,
      enabled: config.ENABLE_CSRF_PROTECTION,
    },
    rateLimiting: {
      enabled: config.ENABLE_RATE_LIMITING,
      redisUrl: config.REDIS_URL,
      redisPassword: config.REDIS_PASSWORD,
    },
    headers: {
      csp: config.ENABLE_CSP,
      hsts: config.ENABLE_HSTS,
    },
  };
}

/**
 * Email configuration for production
 */
export function getEmailConfig() {
  const config = getProductionConfig();

  if (!config.SMTP_HOST) {
    return null;
  }

  return {
    host: config.SMTP_HOST,
    port: config.SMTP_PORT || 587,
    secure: config.SMTP_SECURE || false,
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASS,
    },
    from: {
      email: config.FROM_EMAIL,
      name: config.FROM_NAME,
    },
  };
}

/**
 * File storage configuration for production
 */
export function getFileStorageConfig() {
  const config = getProductionConfig();

  if (!config.AWS_ACCESS_KEY_ID) {
    return null;
  }

  return {
    provider: "s3" as const,
    config: {
      credentials: {
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
      },
      region: config.AWS_REGION,
      bucket: config.AWS_S3_BUCKET,
    },
  };
}

/**
 * Monitoring configuration for production
 */
export function getMonitoringConfig() {
  const config = getProductionConfig();

  return {
    sentry: {
      dsn: config.SENTRY_DSN,
      authToken: config.SENTRY_AUTH_TOKEN,
    },
    analytics: {
      gaId: config.NEXT_PUBLIC_GA_ID,
    },
    logging: {
      logtailToken: config.LOGTAIL_SOURCE_TOKEN,
      elasticApmToken: config.ELASTIC_APM_SECRET_TOKEN,
    },
  };
}

/**
 * Feature flags for production
 */
export function getFeatureFlags() {
  const config = getProductionConfig();

  return {
    notifications: config.ENABLE_NOTIFICATIONS,
    fileUploads: config.ENABLE_FILE_UPLOADS,
    search: config.ENABLE_SEARCH,
    calendar: config.ENABLE_CALENDAR,
  };
}

/**
 * Validate required production environment variables
 */
export function validateProductionEnvironment(): boolean {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXTAUTH_SECRET",
    "CSRF_SECRET",
    "SESSION_SECRET",
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error("Missing required production environment variables:", missing);
    return false;
  }

  return true;
}

/**
 * Get secure headers configuration
 */
export function getSecureHeadersConfig() {
  const config = getProductionConfig();

  return {
    "Content-Security-Policy": config.ENABLE_CSP ? [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co",
      "connect-src 'self' https://api.stripe.com https://*.supabase.co wss://*.supabase.co",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; ") : undefined,

    "Strict-Transport-Security": config.ENABLE_HSTS ?
      "max-age=31536000; includeSubDomains; preload" : undefined,

    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "X-DNS-Prefetch-Control": "off",
    "X-Download-Options": "noopen",
    "X-Permitted-Cross-Domain-Policies": "none",
  };
}