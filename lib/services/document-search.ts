/**
 * Document Search and Filter Service
 * Phase 4: T-026 - Search & Filter Backend
 *
 * Handles advanced search and filtering for documents
 */

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { DocumentSearchParams, DocumentSearchResult } from "@/types/document";
import { canAccessDocument } from "./document-access";

/**
 * Search and filter documents with pagination
 */
export async function searchDocuments(
  userId: string,
  params: DocumentSearchParams
): Promise<DocumentSearchResult> {
  const {
    query,
    categories,
    tags,
    uploadedBy,
    dateFrom,
    dateTo,
    expiryStatus,
    accessLevel,
    sortBy = "uploadedAt",
    sortOrder = "desc",
    page = 1,
    limit = 20,
  } = params;

  // Build where clause
  const where: Prisma.CompanyDocumentWhereInput = {};

  // Text search on title and description
  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
  }

  // Filter by categories
  if (categories && categories.length > 0) {
    where.category = { in: categories };
  }

  // Filter by tags
  if (tags && tags.length > 0) {
    where.tags = { hasSome: tags };
  }

  // Filter by uploader
  if (uploadedBy) {
    where.uploaded_by = uploadedBy;
  }

  // Filter by upload date range
  if (dateFrom || dateTo) {
    where.created_at = {};
    if (dateFrom) {
      where.created_at.gte = new Date(dateFrom);
    }
    if (dateTo) {
      where.created_at.lte = new Date(dateTo);
    }
  }

  // Filter by expiry status
  if (expiryStatus) {
    const now = new Date();

    if (expiryStatus === "expired") {
      where.expiry_date = { lt: now };
    } else if (expiryStatus === "expiring") {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      where.expiry_date = { gte: now, lte: futureDate };
    }
  }

  // Filter by access level
  if (accessLevel) {
    where.access_level = accessLevel;
  }

  // Build orderBy clause
  const orderBy = buildOrderByClause(sortBy, sortOrder);

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Execute query
  const [documents, total] = await Promise.all([
    prisma.companyDocument.findMany({
      where,
      include: {
        uploader: {
          include: {
            profile: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.companyDocument.count({ where }),
  ]);

  // Filter documents based on user access (application-level security)
  // This is in addition to RLS policies
  const accessibleDocuments = await filterAccessibleDocuments(
    userId,
    documents
  );

  const totalPages = Math.ceil(total / limit);

  return {
    documents: accessibleDocuments,
    total,
    page,
    totalPages,
    limit,
  };
}

/**
 * Filter documents based on user access permissions
 */
async function filterAccessibleDocuments(userId: string, documents: any[]) {
  const accessChecks = await Promise.all(
    documents.map((doc) => canAccessDocument(userId, doc.id))
  );

  return documents.filter((_, index) => accessChecks[index]);
}

/**
 * Build Prisma orderBy clause
 */
function buildOrderByClause(
  sortBy: string,
  sortOrder: "asc" | "desc"
): Prisma.CompanyDocumentOrderByWithRelationInput {
  const orderByMap: Record<string, any> = {
    title: { title: sortOrder },
    uploadedAt: { created_at: sortOrder },
    fileSize: { file_size: sortOrder },
    category: { category: sortOrder },
    expiryDate: { expiry_date: sortOrder },
  };

  return orderByMap[sortBy] || { created_at: sortOrder };
}

/**
 * Get popular search queries (for analytics)
 */
export async function getPopularSearches(
  limit: number = 10
): Promise<string[]> {
  // This would require a separate search_logs table
  // For now, return empty array
  return [];
}

/**
 * Get available filter options (for UI)
 */
export async function getFilterOptions(userId: string) {
  // Get distinct categories
  const categories = await prisma.companyDocument.findMany({
    select: { category: true },
    distinct: ["category"],
  });

  // Get all unique tags
  const allDocuments = await prisma.companyDocument.findMany({
    select: { tags: true },
  });

  const tagsSet = new Set<string>();
  allDocuments.forEach((doc) => {
    doc.tags.forEach((tag) => tagsSet.add(tag));
  });

  // Get uploaders (HR and Admin only)
  const uploaders = await prisma.user.findMany({
    where: {
      profile: {
        role: {
          in: ["HR", "ADMIN"],
        },
      },
    },
    include: {
      profile: true,
    },
  });

  return {
    categories: categories.map((c) => c.category),
    tags: Array.from(tagsSet).sort(),
    uploaders: uploaders.map((u) => ({
      id: u.id,
      name: u.profile?.full_name || u.email,
    })),
  };
}

/**
 * Get document statistics (for dashboard)
 */
export async function getDocumentStatistics() {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);

  const [total, expired, expiring, byCategory] = await Promise.all([
    prisma.companyDocument.count(),
    prisma.companyDocument.count({
      where: { expiry_date: { lt: now } },
    }),
    prisma.companyDocument.count({
      where: { expiry_date: { gte: now, lte: futureDate } },
    }),
    prisma.companyDocument.groupBy({
      by: ["category"],
      _count: true,
    }),
  ]);

  return {
    total,
    expired,
    expiring,
    byCategory: byCategory.map((item) => ({
      category: item.category,
      count: item._count,
    })),
  };
}
