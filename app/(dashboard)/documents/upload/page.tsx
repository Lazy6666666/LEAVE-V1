// Document Upload Page
// T-021: Upload interface for Admin/HR users

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DocumentUploadForm } from "@/components/documents/DocumentUploadForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function DocumentUploadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user has permission to upload (Admin or HR)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  const canUpload = profile?.role === "ADMIN" || profile?.role === "HR";

  if (!canUpload) {
    redirect("/dashboard/documents");
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/documents"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Document</h1>
          <p className="text-muted-foreground">
            Add a new document to the company library
          </p>
        </div>
      </div>

      {/* Upload Form */}
      <DocumentUploadForm />
    </div>
  );
}
