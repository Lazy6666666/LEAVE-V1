// Prisma Client with Accelerate Extension and Enhanced Connection Pooling
// This file provides a singleton Prisma Client instance with optimized connection management

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Enhanced Prisma Client configuration for performance
const prismaConfig = {
  // Connection pool settings
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },

  // Connection pooling optimization
  log:
    process.env.NODE_ENV === "development"
      ? ["query" as const, "error" as const, "warn" as const]
      : ["error" as const],

  // Performance optimizations
  // Note: These settings are configured via DATABASE_URL connection string parameters
  // Example: postgresql://user:pass@host:port/db?connection_limit=20&pool_timeout=20
};

// Read replica support for dashboard queries (if configured)
const readReplicaUrl = process.env.DATABASE_READ_REPLICA_URL;

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaConfig);

// Read replica client for reporting queries (optional)
export const readOnlyPrisma = readReplicaUrl
  ? new PrismaClient({
      datasources: {
        db: {
          url: readReplicaUrl,
        },
      },
      log: ["error"],
    })
  : prisma;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma as PrismaClient;
}

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
  if (readOnlyPrisma !== prisma) {
    await readOnlyPrisma.$disconnect();
  }
});

export default prisma;
