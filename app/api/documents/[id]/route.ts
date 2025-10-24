/**
 * Document CRUD API
 * Phase 4: T-024 - Access Control
 *
 * GET    /api/documents/[id] - Get single document
 * PATCH  /api/documents/[id] - Update document metadata
 * DELETE /api/documents/[id] - Delete document
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  canAccessDocument,
  canEditDocument,
  canDeleteDocument,
} from "@/lib/services/document-access";
import { logDocumentAccess } from "@/lib/services/document-audit";

/**
 * GET /api/documents/[id] - Get single document with access check
 */
// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
    // Import Prisma dynamically
    const { prisma } = await import("@/lib/prisma");

) {
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

    // Check access permission
    const hasAccess = await canAccessDocument(user.id, documentId);
    if (!hasAccess) {
      await logDocumentAccess(user.id, documentId, "ACCESS_DENIED", {
        action: "VIEW",
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

    // Log access
    await logDocumentAccess(user.id, documentId, "VIEW");

    return NextResponse.json({ document });
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/documents/[id] - Update document metadata
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check edit permission
    const canEdit = await canEditDocument(user.id, documentId);
    if (!canEdit) {
      await logDocumentAccess(user.id, documentId, "ACCESS_DENIED", {
        action: "EDIT",
      });
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { title, description, category, tags, access_level, expiry_date } =
      body;

    // Update document
    const updatedDocument = await prisma.companyDocument.update({
      where: { id: documentId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(tags && { tags }),
        ...(access_level && { access_level }),
        ...(expiry_date !== undefined && {
          expiry_date: expiry_date ? new Date(expiry_date) : null,
        }),
      },
    });

    // Log edit
    await logDocumentAccess(user.id, documentId, "EDIT", {
      changes: body,
    });

    return NextResponse.json({
      message: "Document updated successfully",
      document: updatedDocument,
    });
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents/[id] - Delete document (ADMIN only)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check delete permission
    const canDelete = await canDeleteDocument(user.id, documentId);
    if (!canDelete) {
      await logDocumentAccess(user.id, documentId, "ACCESS_DENIED", {
        action: "DELETE",
      });
      return NextResponse.json(
        { error: "Only administrators can delete documents" },
        { status: 403 }
      );
    }

    // Get document info before deletion
    const document = await prisma.companyDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Delete document from database
    await prisma.companyDocument.delete({
      where: { id: documentId },
    });

    // TODO: Delete file from Supabase Storage
    // const supabaseAdmin = createAdminClient();
    // await supabaseAdmin.storage
    //   .from('company-documents')
    //   .remove([document.file_url]);

    // Log deletion
    await logDocumentAccess(user.id, documentId, "DELETE", {
      documentTitle: document.title,
      fileName: document.file_name,
    });

    return NextResponse.json({
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
