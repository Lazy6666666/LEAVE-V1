/**
 * Document Expiry API
 * Phase 4: T-025 - Expiry Tracking
 *
 * GET /api/documents/expiry - Get expiring/expired documents
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getExpiringDocuments,
  getExpiredDocuments,
  getDocumentsByExpiryStatus,
} from "@/lib/services/document-expiry";

/**
 * GET /api/documents/expiry
 * Query params:
 *  - status: "expiring" | "expired" | "all"
 *  - days: number (for expiring status, default 30)
 */
// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Import Prisma dynamically
  const { prisma } = await import("@/lib/prisma");

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check user role (only HR and ADMIN can view expiry reports)
    const profile = await prisma.profile.findUnique({
      where: { user_id: user.id },
    });

    if (!profile || !["HR", "ADMIN"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Access denied. HR or Admin role required." },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const days = parseInt(searchParams.get("days") || "30");

    let documents;

    if (status === "expired") {
      documents = await getExpiredDocuments();
    } else if (status === "expiring") {
      documents = await getExpiringDocuments(days);
    } else {
      documents = await getDocumentsByExpiryStatus("all", days);
    }

    // Separate into expiring and expired for summary
    const now = new Date();
    const expiring = documents.filter(
      (doc) => doc.expiry_date && doc.expiry_date > now
    );
    const expired = documents.filter(
      (doc) => doc.expiry_date && doc.expiry_date <= now
    );

    return NextResponse.json({
      expiring,
      expired,
      total: documents.length,
      summary: {
        expiringCount: expiring.length,
        expiredCount: expired.length,
      },
    });
  } catch (error) {
    console.error("Error fetching expiry data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
