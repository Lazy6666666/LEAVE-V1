/**
 * Document Expiry Tracking Service
 * Phase 4: T-025 - Expiry Tracking
 *
 * Handles document expiry checking and notifications
 */

import { DocumentExpiryStatus, EXPIRY_THRESHOLDS } from "@/types/document";

/**
 * Check if document is expired
 */
export function isDocumentExpired(expiryDate: Date | null): boolean {
  if (!expiryDate) return false;
  return new Date() > new Date(expiryDate);
}

/**
 * Calculate days until document expiry
 */
export function getDaysUntilExpiry(expiryDate: Date | null): number | null {
  if (!expiryDate) return null;

  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Get expiry status for a document
 */
export function getExpiryStatus(expiryDate: Date | null): DocumentExpiryStatus {
  if (!expiryDate) {
    return {
      isExpired: false,
      daysUntilExpiry: null,
      expiryDate: null,
      status: "no_expiry",
    };
  }

  const isExpired = isDocumentExpired(expiryDate);
  const daysUntilExpiry = getDaysUntilExpiry(expiryDate);

  if (isExpired) {
    return {
      isExpired: true,
      daysUntilExpiry,
      expiryDate,
      status: "expired",
    };
  }

  if (daysUntilExpiry !== null && daysUntilExpiry <= EXPIRY_THRESHOLDS.NOTICE) {
    return {
      isExpired: false,
      daysUntilExpiry,
      expiryDate,
      status: "expiring_soon",
    };
  }

  return {
    isExpired: false,
    daysUntilExpiry,
    expiryDate,
    status: "valid",
  };
}

/**
 * Get documents expiring within specified days
 */
export async function getExpiringDocuments(daysAhead: number = 30) {
  // Import Prisma dynamically
  const { prisma } = await import("@/lib/prisma");

  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return await prisma.companyDocument.findMany({
    where: {
      expiry_date: {
        gte: now,
        lte: futureDate,
      },
    },
    // Note: uploader relation doesn't exist in schema, using uploaded_by field instead
    // Could join with User/Profile if needed via separate query
    orderBy: {
      expiry_date: "asc",
    },
  });
}

/**
 * Get expired documents
 */
export async function getExpiredDocuments() {
  // Import Prisma dynamically
  const { prisma } = await import("@/lib/prisma");

  const now = new Date();

  return await prisma.companyDocument.findMany({
    where: {
      expiry_date: {
        lt: now,
      },
    },
    // Note: uploader relation doesn't exist in schema, using uploaded_by field instead
    // Could join with User/Profile if needed via separate query
    orderBy: {
      expiry_date: "desc",
    },
  });
}

/**
 * Get documents by expiry status
 */
export async function getDocumentsByExpiryStatus(
  status: "expiring" | "expired" | "all",
  daysAhead: number = 30
) {
  // Import Prisma dynamically
  const { prisma } = await import("@/lib/prisma");

  if (status === "expired") {
    return await getExpiredDocuments();
  }

  if (status === "expiring") {
    return await getExpiringDocuments(daysAhead);
  }

  // Return all documents with expiry dates
  return await prisma.companyDocument.findMany({
    where: {
      expiry_date: {
        not: null,
      },
    },
    // Note: uploader relation doesn't exist in schema, using uploaded_by field instead
    // Could join with User/Profile if needed via separate query
    orderBy: {
      expiry_date: "asc",
    },
  });
}

/**
 * Send expiry notification (integrates with notification system)
 */
export async function sendExpiryNotification(
  documentId: string,
  daysRemaining: number
): Promise<void> {
  try {
    // Get document details
    const document = await prisma.companyDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) return;

    // Get HR and Admin users to notify
    const recipients = await prisma.profile.findMany({
      where: {
        role: {
          in: ["HR", "ADMIN"],
        },
      },
    });

    // Create notifications
    const notifications = recipients.map((recipient) => ({
      user_id: recipient.user_id,
      type: "DOCUMENT_EXPIRY",
      title: "Document Expiring Soon",
      message: `Document "${document.title}" will expire in ${daysRemaining} days`,
      link: `/documents/${documentId}`,
      read: false,
    }));

    await prisma.notificationLog.createMany({
      data: notifications,
    });
  } catch (error) {
    console.error("Failed to send expiry notification:", error);
  }
}

/**
 * Check and send notifications for expiring documents
 * This should be called by a cron job
 */
export async function checkAndNotifyExpiringDocuments(): Promise<{
  processed: number;
  notified: number;
}> {
  try {
    // Get documents expiring in 30, 14, and 7 days
    const criticalDays = [
      EXPIRY_THRESHOLDS.NOTICE, // 30 days
      EXPIRY_THRESHOLDS.WARNING, // 14 days
      EXPIRY_THRESHOLDS.CRITICAL, // 7 days
    ];

    let processed = 0;
    let notified = 0;

    for (const days of criticalDays) {
      // Get documents expiring exactly in N days (to avoid duplicate notifications)
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      targetDate.setHours(0, 0, 0, 0);

      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const documents = await prisma.companyDocument.findMany({
        where: {
          expiry_date: {
            gte: targetDate,
            lt: nextDay,
          },
        },
      });

      processed += documents.length;

      for (const doc of documents) {
        await sendExpiryNotification(doc.id, days);
        notified++;
      }
    }

    return { processed, notified };
  } catch (error) {
    console.error("Error checking expiring documents:", error);
    return { processed: 0, notified: 0 };
  }
}
