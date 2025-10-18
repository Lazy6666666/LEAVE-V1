"use client";

/**
 * Document Library Client Component
 * T-023 & T-026: Client-side filtering and document display
 */

import { useState, useMemo } from "react";
import { Upload, Download, FileText } from "lucide-react";
import Link from "next/link";
import { DocumentList } from "@/components/documents/DocumentList";
import {
  DocumentFilters,
  type DocumentFilterState,
} from "@/components/documents/DocumentFilters";
import type { DocumentWithUploader } from "@/types/document";

interface DocumentLibraryClientProps {
  initialDocuments: DocumentWithUploader[];
  availableTags: string[];
  availableUploaders: { id: string; name: string }[];
  canEdit: boolean;
  canDelete: boolean;
}

export function DocumentLibraryClient({
  initialDocuments,
  availableTags,
  availableUploaders,
  canEdit,
  canDelete,
}: DocumentLibraryClientProps) {
  const [filters, setFilters] = useState<DocumentFilterState>({
    search: "",
    categories: [],
    tags: [],
    uploaders: [],
    dateFrom: "",
    dateTo: "",
    expiryStatus: "all",
    sortBy: "uploadedAt",
    sortOrder: "desc",
  });

  // Client-side filtering and sorting
  const filteredDocuments = useMemo(() => {
    let filtered = [...initialDocuments];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchLower) ||
          doc.description?.toLowerCase().includes(searchLower) ||
          doc.file_name.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter((doc) =>
        filters.categories.includes(doc.category)
      );
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter((doc) =>
        filters.tags.some((tag) => doc.tags.includes(tag))
      );
    }

    // Uploader filter
    if (filters.uploaders.length > 0) {
      filtered = filtered.filter((doc) =>
        filters.uploaders.includes(doc.uploaded_by)
      );
    }

    // Date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter((doc) => new Date(doc.created_at) >= fromDate);
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter((doc) => new Date(doc.created_at) <= toDate);
    }

    // Expiry status filter
    if (filters.expiryStatus !== "all") {
      filtered = filtered.filter((doc) => {
        if (!doc.expiry_date) return false;

        const now = new Date();
        const expiry = new Date(doc.expiry_date);
        const diffTime = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (filters.expiryStatus === "expired") {
          return diffDays < 0;
        } else if (filters.expiryStatus === "expiring") {
          return diffDays >= 0 && diffDays <= 30;
        }
        return true;
      });
    }

    // Access level filter
    if (filters.accessLevel) {
      filtered = filtered.filter(
        (doc) => doc.access_level === filters.accessLevel
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let compareA: any;
      let compareB: any;

      switch (filters.sortBy) {
        case "title":
          compareA = a.title.toLowerCase();
          compareB = b.title.toLowerCase();
          break;
        case "uploadedAt":
          compareA = new Date(a.created_at).getTime();
          compareB = new Date(b.created_at).getTime();
          break;
        case "fileSize":
          compareA = a.file_size;
          compareB = b.file_size;
          break;
        case "category":
          compareA = a.category.toLowerCase();
          compareB = b.category.toLowerCase();
          break;
        default:
          compareA = new Date(a.created_at).getTime();
          compareB = new Date(b.created_at).getTime();
      }

      if (compareA < compareB) return filters.sortOrder === "asc" ? -1 : 1;
      if (compareA > compareB) return filters.sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [initialDocuments, filters]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = initialDocuments.length;
    const categories = new Set(initialDocuments.map((doc) => doc.category))
      .size;
    const expiring = initialDocuments.filter((doc) => {
      if (!doc.expiry_date) return false;
      const now = new Date();
      const expiry = new Date(doc.expiry_date);
      const diffDays = Math.ceil(
        (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diffDays >= 0 && diffDays <= 30;
    }).length;

    return { total, categories, expiring };
  }, [initialDocuments]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Documents
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {stats.total}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Categories
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {stats.categories}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Download className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Expiring Soon
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {stats.expiring}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
              <FileText className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Upload Button (Admin/HR only) */}
      {canEdit && (
        <div className="flex justify-end">
          <Link
            href="/dashboard/documents/upload"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            <Upload className="h-5 w-5" />
            Upload Document
          </Link>
        </div>
      )}

      {/* Filters */}
      <DocumentFilters
        filters={filters}
        onFiltersChange={setFilters}
        availableTags={availableTags}
        availableUploaders={availableUploaders}
      />

      {/* Document List */}
      <DocumentList
        documents={filteredDocuments}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    </div>
  );
}
