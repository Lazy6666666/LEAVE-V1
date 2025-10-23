/**
 * Documents Listing API
 * Phase 4: T-026 - Search & Filter Backend
 *
 * GET /api/documents - List documents with search and filter
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchDocuments } from "@/lib/services/document-search";
import { DocumentSearchParams } from "@/types/document";

/**
 * GET /api/documents
 * Advanced search and filter for documents
 *
 * Query params:
 *  - query: text search
 *  - category: comma-separated categories
 *  - tags: comma-separated tags
 *  - uploadedBy: user ID
 *  - dateFrom: ISO date
 *  - dateTo: ISO date
 *  - expiryStatus: "all" | "expiring" | "expired"
 *  - accessLevel: access level filter
 *  - sortBy: "title" | "uploadedAt" | "fileSize" | "category" | "expiryDate"
 *  - sortOrder: "asc" | "desc"
 *  - page: page number (default 1)
 *  - limit: results per page (default 20)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);

    const params: DocumentSearchParams = {
      query: searchParams.get("query") || undefined,
      categories: searchParams.get("category")?.split(",").filter(Boolean),
      tags: searchParams.get("tags")?.split(",").filter(Boolean),
      uploadedBy: searchParams.get("uploadedBy") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
      expiryStatus: (searchParams.get("expiryStatus") as any) || undefined,
      accessLevel: (searchParams.get("accessLevel") as any) || undefined,
      sortBy: (searchParams.get("sortBy") as any) || "uploadedAt",
      sortOrder: (searchParams.get("sortOrder") as any) || "desc",
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    };

    // Search documents
    const result = await searchDocuments(user.id, params);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error searching documents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
