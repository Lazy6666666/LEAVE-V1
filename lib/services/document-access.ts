/**
 * Document Access Control Service
 * Phase 4: T-024 - Access Control
 *
 * Handles all document access control logic
 */

import { prisma } from "@/lib/prisma";
import { Role, AccessLevel } from "@prisma/client";
import { DocumentAccessCheck } from "@/types/document";
import { logDocumentAccess } from "./document-audit";

/**
 * Check if user can access (view) a document
 */
export async function canAccessDocument(
  userId: string,
  documentId: string
): Promise<boolean> {
  try {
    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) return false;

    // Get document
    const document = await prisma.companyDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) return false;

    // Check access
    return checkDocumentAccess(
      profile.role,
      document.access_level,
      document.uploaded_by,
      userId
    );
  } catch (error) {
    console.error("Error checking document access:", error);
    return false;
  }
}

/**
 * Check if user can download a document
 */
export async function canDownloadDocument(
  userId: string,
  documentId: string
): Promise<boolean> {
  // Same as view access for now
  return await canAccessDocument(userId, documentId);
}

/**
 * Check if user can edit a document
 */
export async function canEditDocument(
  userId: string,
  documentId: string
): Promise<boolean> {
  try {
    const profile = await prisma.profile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) return false;

    const document = await prisma.companyDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) return false;

    // ADMIN and HR can edit all documents
    if (profile.role === "ADMIN" || profile.role === "HR") {
      return true;
    }

    // Uploader can edit their own documents
    return document.uploaded_by === userId;
  } catch (error) {
    console.error("Error checking edit permission:", error);
    return false;
  }
}

/**
 * Check if user can delete a document
 */
export async function canDeleteDocument(
  userId: string,
  documentId: string
): Promise<boolean> {
  try {
    const profile = await prisma.profile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) return false;

    // Only ADMIN can delete documents
    return profile.role === "ADMIN";
  } catch (error) {
    console.error("Error checking delete permission:", error);
    return false;
  }
}

/**
 * Get comprehensive access check for a document
 */
export async function getDocumentAccessCheck(
  userId: string,
  documentId: string
): Promise<DocumentAccessCheck> {
  const [canView, canDownload, canEdit, canDelete] = await Promise.all([
    canAccessDocument(userId, documentId),
    canDownloadDocument(userId, documentId),
    canEditDocument(userId, documentId),
    canDeleteDocument(userId, documentId),
  ]);

  return {
    canView,
    canDownload,
    canEdit,
    canDelete,
  };
}

/**
 * Core access control logic
 */
function checkDocumentAccess(
  userRole: Role,
  documentAccessLevel: AccessLevel,
  documentUploadedBy: string,
  userId: string
): boolean {
  // ADMIN and HR can access all documents
  if (userRole === "ADMIN" || userRole === "HR") {
    return true;
  }

  // PUBLIC documents are accessible by all
  if (documentAccessLevel === "PUBLIC") {
    return true;
  }

  // Check role-based access
  const roleHierarchy: Record<AccessLevel, Role[]> = {
    PUBLIC: ["EMPLOYEE", "MANAGER", "HR", "ADMIN"],
    EMPLOYEE: ["EMPLOYEE", "MANAGER", "HR", "ADMIN"],
    MANAGER: ["MANAGER", "HR", "ADMIN"],
    HR: ["HR", "ADMIN"],
    ADMIN: ["ADMIN"],
  };

  const allowedRoles = roleHierarchy[documentAccessLevel];
  return allowedRoles.includes(userRole);
}

/**
 * Validate document access and log the attempt
 */
export async function validateAndLogAccess(
  userId: string,
  documentId: string,
  action: "VIEW" | "DOWNLOAD" | "EDIT" | "DELETE"
): Promise<{ allowed: boolean; reason?: string }> {
  let allowed = false;

  switch (action) {
    case "VIEW":
      allowed = await canAccessDocument(userId, documentId);
      break;
    case "DOWNLOAD":
      allowed = await canDownloadDocument(userId, documentId);
      break;
    case "EDIT":
      allowed = await canEditDocument(userId, documentId);
      break;
    case "DELETE":
      allowed = await canDeleteDocument(userId, documentId);
      break;
  }

  // Log the access attempt
  if (allowed) {
    await logDocumentAccess(userId, documentId, action);
  } else {
    await logDocumentAccess(userId, documentId, "ACCESS_DENIED", {
      attemptedAction: action,
    });
  }

  return {
    allowed,
    reason: allowed ? undefined : `Access denied for action: ${action}`,
  };
}

/**
 * Get RLS policy SQL for Supabase
 */
export function getDocumentRLSPolicies(): string[] {
  return [
    // Policy 1: View Access
    `
    CREATE POLICY "Users can view accessible documents"
    ON company_documents FOR SELECT
    USING (
      -- Admin and HR can see all
      auth.uid() IN (
        SELECT user_id FROM profiles WHERE role IN ('ADMIN', 'HR')
      )
      OR
      -- PUBLIC documents visible to all authenticated users
      access_level = 'PUBLIC'
      OR
      -- Role-based access
      (
        access_level = 'EMPLOYEE' AND auth.uid() IN (
          SELECT user_id FROM profiles WHERE role IN ('EMPLOYEE', 'MANAGER', 'HR', 'ADMIN')
        )
      )
      OR
      (
        access_level = 'MANAGER' AND auth.uid() IN (
          SELECT user_id FROM profiles WHERE role IN ('MANAGER', 'HR', 'ADMIN')
        )
      )
      OR
      (
        access_level = 'HR' AND auth.uid() IN (
          SELECT user_id FROM profiles WHERE role IN ('HR', 'ADMIN')
        )
      )
      OR
      (
        access_level = 'ADMIN' AND auth.uid() IN (
          SELECT user_id FROM profiles WHERE role = 'ADMIN'
        )
      )
    );
    `,

    // Policy 2: Upload Documents
    `
    CREATE POLICY "Only admins and HR can upload documents"
    ON company_documents FOR INSERT
    WITH CHECK (
      auth.uid() IN (
        SELECT user_id FROM profiles WHERE role IN ('ADMIN', 'HR')
      )
    );
    `,

    // Policy 3: Update Documents
    `
    CREATE POLICY "Admins, HR, or uploader can update documents"
    ON company_documents FOR UPDATE
    USING (
      auth.uid() IN (
        SELECT user_id FROM profiles WHERE role IN ('ADMIN', 'HR')
      )
      OR uploaded_by = auth.uid()
    );
    `,

    // Policy 4: Delete Documents
    `
    CREATE POLICY "Only admins can delete documents"
    ON company_documents FOR DELETE
    USING (
      auth.uid() IN (
        SELECT user_id FROM profiles WHERE role = 'ADMIN'
      )
    );
    `,
  ];
}
