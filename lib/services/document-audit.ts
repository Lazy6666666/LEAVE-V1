/**
 * Document Audit Logging Service
 * Phase 4: T-024 - Access Control
 *
 * Logs all document access events for security audit trail
 */

import { DocumentAuditAction } from "@/types/document";

/**
 * Log document access event
 */
export async function logDocumentAccess(
  userId: string,
  documentId: string,
  action: DocumentAuditAction,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    // Import Prisma dynamically
    const { prisma } = await import("@/lib/prisma");

    await prisma.auditLog.create({
      data: {
        user_id: userId,
        action: `DOCUMENT_${action}`,
        entity_type: "DOCUMENT",
        entity_id: documentId,
        new_values: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    console.error("Failed to log document access:", error);
    // Don't throw - logging failure shouldn't block operations
  }
}

/**
 * Get document access history
 */
export async function getDocumentAccessHistory(
  documentId: string,
  limit: number = 50
) {
  // Import Prisma dynamically
  const { prisma } = await import("@/lib/prisma");

  return await prisma.auditLog.findMany({
    where: {
      entity_type: "DOCUMENT",
      entity_id: documentId,
    },
    orderBy: {
      created_at: "desc",
    },
    take: limit,
  });
}

/**
 * Get user's document access history
 */
export async function getUserDocumentAccessHistory(
  userId: string,
  limit: number = 50
) {
  // Import Prisma dynamically
  const { prisma } = await import("@/lib/prisma");

  return await prisma.auditLog.findMany({
    where: {
      user_id: userId,
      entity_type: "DOCUMENT",
    },
    orderBy: {
      created_at: "desc",
    },
    take: limit,
  });
}

/**
 * Get recent access denied attempts (security monitoring)
 */
export async function getAccessDeniedAttempts(hours: number = 24) {
  // Import Prisma dynamically
  const { prisma } = await import("@/lib/prisma");

  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  return await prisma.auditLog.findMany({
    where: {
      entity_type: "DOCUMENT",
      action: "DOCUMENT_ACCESS_DENIED",
      created_at: {
        gte: since,
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });
}
