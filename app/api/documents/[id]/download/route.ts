/**
 * Document Download API
 * Phase 4: T-024 - Access Control
 *
 * GET /api/documents/[id]/download - Download document with access check
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canDownloadDocument } from "@/lib/services/document-access";
import { logDocumentAccess } from "@/lib/services/document-audit";

/**
 * GET /api/documents/[id]/download
 * Returns a signed URL for downloading the document
 */
// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const documentId = params.id;

    // Check download permission
    const canDownload = await canDownloadDocument(user.id, documentId);
    if (!canDownload) {
      await logDocumentAccess(user.id, documentId, "ACCESS_DENIED", {
        action: "DOWNLOAD",
      });
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch document
    const document = await prisma.companyDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Generate signed URL from Supabase Storage
    const { data: signedUrlData, error: storageError } = await supabase.storage
      .from("company-documents")
      .createSignedUrl(document.file_url, 300); // 5 minutes expiry

    if (storageError || !signedUrlData) {
      console.error("Error generating signed URL:", storageError);
      return NextResponse.json(
        { error: "Failed to generate download URL" },
        { status: 500 }
      );
    }

    // Log download
    await logDocumentAccess(user.id, documentId, "DOWNLOAD", {
      fileName: document.file_name,
      fileSize: document.file_size,
    });

    return NextResponse.json({
      downloadUrl: signedUrlData.signedUrl,
      fileName: document.file_name,
      expiresIn: 300, // seconds
    });
  } catch (error) {
    console.error("Error processing download:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
