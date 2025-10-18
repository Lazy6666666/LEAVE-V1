// Document Library Page
// T-023: Main document library with search and filters

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DocumentLibraryClient } from "./DocumentLibraryClient";
import prisma from "@/lib/prisma";

export default async function DocumentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile to check permissions
  const profile = await prisma.profile.findUnique({
    where: { user_id: user.id },
    select: {
      role: true,
      full_name: true,
    },
  });

  if (!profile) {
    redirect("/login");
  }

  const canEdit = profile.role === "ADMIN" || profile.role === "HR";
  const canDelete = profile.role === "ADMIN";

  // Get initial documents (first page)
  const rawDocuments = await prisma.companyDocument.findMany({
    take: 20,
    orderBy: {
      created_at: "desc",
    },
  });

  // Get uploaders for the documents
  const uploaderIds = Array.from(
    new Set(rawDocuments.map((doc: any) => doc.uploaded_by))
  );
  const uploaders = await prisma.user.findMany({
    where: {
      id: {
        in: uploaderIds,
      },
    },
    select: {
      id: true,
      email: true,
      profile: {
        select: {
          full_name: true,
          role: true,
          department: true,
          avatar_url: true,
        },
      },
    },
  });

  // Create uploader map for efficient lookup
  const uploaderMap = new Map(uploaders.map((u: any) => [u.id, u]));

  // Get all unique tags for filter
  const allDocuments = await prisma.companyDocument.findMany({
    select: {
      tags: true,
      uploaded_by: true,
    },
  });

  const allTags = Array.from(
    new Set(
      allDocuments.flatMap((doc: any) =>
        doc.tags.filter((tag: any): tag is string => typeof tag === "string")
      )
    )
  ).sort() as string[];

  const uploadersList = uploaders.map((u: any) => ({
    id: u.id,
    name: u.profile?.full_name || u.email,
  }));

  // Format documents with uploader info
  const formattedDocuments = rawDocuments.map((doc: any) => {
    const uploader = uploaderMap.get(doc.uploaded_by) || {
      id: doc.uploaded_by,
      email: "Unknown",
      profile: null,
    };

    return {
      ...doc,
      created_at: doc.created_at.toISOString(),
      updated_at: doc.updated_at.toISOString(),
      expiry_date: doc.expiry_date?.toISOString() || null,
      uploader,
    };
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Document Library</h1>
        <p className="text-muted-foreground">
          Browse and download company documents, policies, and resources
        </p>
      </div>

      {/* Client Component with Filters and Document List */}
      <DocumentLibraryClient
        initialDocuments={formattedDocuments}
        availableTags={allTags}
        availableUploaders={uploadersList}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    </div>
  );
}
