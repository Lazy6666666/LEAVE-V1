"use client";

/**
 * Document List Component
 * T-023: Main document list with grid/table view toggle
 */

import { useState } from "react";
import { Grid, List, Loader2 } from "lucide-react";
import { DocumentCard } from "./DocumentCard";
import { DocumentTable } from "./DocumentTable";
import type { DocumentWithUploader } from "@/types/document";

interface DocumentListProps {
  documents: DocumentWithUploader[];
  canEdit?: boolean;
  canDelete?: boolean;
  isLoading?: boolean;
}

export function DocumentList({
  documents,
  canEdit = false,
  canDelete = false,
  isLoading = false,
}: DocumentListProps) {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Action handlers
  const handleDownload = async (id: string) => {
    try {
      const response = await fetch(`/api/documents/${id}/download`);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const doc = documents.find((d) => d.id === id);
      link.download = doc?.file_name || "document";
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download document");
    }
  };

  const handleView = (id: string) => {
    // For now, just download the document since view route doesn't exist
    handleDownload(id);
  };

  const handleEdit = (id: string) => {
    // Navigate to edit page
    window.location.href = `/dashboard/documents/${id}/edit`;
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Delete failed");

      // Reload page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete document");
    }
  };

  const handleShare = (id: string) => {
    const url = `${window.location.origin}/dashboard/documents/${id}`;
    navigator.clipboard.writeText(url);
    alert("Document link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {documents.length} document{documents.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2 rounded-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-primary text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            title="Grid view"
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "table"
                ? "bg-primary text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            title="Table view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Empty State */}
      {documents.length === 0 && (
        <div className="rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 p-12 text-center">
          <div className="inline-flex p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <Grid className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No documents found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your filters or upload a new document to get started
          </p>
        </div>
      )}

      {/* Document Views */}
      {documents.length > 0 &&
        (viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                canEdit={canEdit}
                canDelete={canDelete}
                onDownload={handleDownload}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onShare={handleShare}
              />
            ))}
          </div>
        ) : (
          <DocumentTable
            documents={documents}
            canEdit={canEdit}
            canDelete={canDelete}
            onDownload={handleDownload}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
    </div>
  );
}
