"use client";

/**
 * Document Card Component
 * T-023: Grid view card for documents
 */

import { useState } from "react";
import {
  Download,
  Eye,
  Edit2,
  Trash2,
  Share2,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  File,
  MoreVertical,
  Calendar,
  User,
  Tag,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import type { DocumentWithUploader } from "@/types/document";
// AccessLevel enum from Prisma
enum AccessLevel {
  PUBLIC = "PUBLIC",
  EMPLOYEE = "EMPLOYEE",
  MANAGER = "MANAGER",
  ADMIN = "ADMIN",
  HR = "HR",
}

interface DocumentCardProps {
  document: DocumentWithUploader;
  canEdit?: boolean;
  canDelete?: boolean;
  onDownload?: (id: string) => void;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onShare?: (id: string) => void;
}

// Helper to get file icon and color
function getFileIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "pdf":
      return { icon: FileText, color: "#EF4444" };
    case "doc":
    case "docx":
      return { icon: FileText, color: "#3B82F6" };
    case "xls":
    case "xlsx":
      return { icon: FileSpreadsheet, color: "#10B981" };
    case "png":
    case "jpg":
    case "jpeg":
      return { icon: ImageIcon, color: "#8B5CF6" };
    default:
      return { icon: File, color: "#6B7280" };
  }
}

// Helper to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

// Helper to check expiry
function getExpiryStatus(expiryDate: Date | null) {
  if (!expiryDate) return null;

  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { status: "expired", days: Math.abs(diffDays) };
  if (diffDays <= 30) return { status: "expiring", days: diffDays };
  return null;
}

// Category badge colors
function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    Policy: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    Procedure:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    Form: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    Template:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    Handbook:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    Guide: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
    Announcement:
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    Training: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
    Compliance: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    Other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  };
  return colors[category] || colors.Other;
}

export function DocumentCard({
  document,
  canEdit = false,
  canDelete = false,
  onDownload,
  onView,
  onEdit,
  onDelete,
  onShare,
}: DocumentCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { icon: FileIcon, color: fileColor } = getFileIcon(document.file_name);
  const expiryStatus = getExpiryStatus(document.expiry_date);

  return (
    <div className="group relative rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 shadow-md hover:shadow-xl transition-all duration-300 p-6 space-y-4">
      {/* Header with Icon and Actions */}
      <div className="flex items-start justify-between">
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${fileColor}15` }}
        >
          <FileIcon className="h-8 w-8" style={{ color: fileColor }} />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-10">
              <div className="py-1">
                {onView && (
                  <button
                    onClick={() => {
                      onView(document.id);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                )}
                {onDownload && (
                  <button
                    onClick={() => {
                      onDownload(document.id);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                )}
                {onShare && (
                  <button
                    onClick={() => {
                      onShare(document.id);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    Share Link
                  </button>
                )}
                {canEdit && onEdit && (
                  <button
                    onClick={() => {
                      onEdit(document.id);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                )}
                {canDelete && onDelete && (
                  <button
                    onClick={() => {
                      onDelete(document.id);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Title and Description */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg line-clamp-2 text-gray-900 dark:text-gray-100">
          {document.title}
        </h3>
        {document.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {document.description}
          </p>
        )}
      </div>

      {/* Category and Tags */}
      <div className="flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(document.category)}`}
        >
          {document.category}
        </span>
        {document.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            <Tag className="h-3 w-3 mr-1" />
            {tag}
          </span>
        ))}
        {document.tags.length > 2 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            +{document.tags.length - 2} more
          </span>
        )}
      </div>

      {/* Expiry Warning */}
      {expiryStatus && (
        <div
          className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
            expiryStatus.status === "expired"
              ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
              : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
          }`}
        >
          {expiryStatus.status === "expired" ? (
            <>
              <AlertTriangle className="h-4 w-4" />
              Expired {expiryStatus.days} days ago
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4" />
              Expires in {expiryStatus.days} days
            </>
          )}
        </div>
      )}

      {/* Footer: Uploader and Metadata */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <User className="h-4 w-4" />
          <span>
            {document.uploader.profile?.full_name || document.uploader.email}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
          <span>{formatFileSize(document.file_size)}</span>
          <span>{format(new Date(document.created_at), "MMM d, yyyy")}</span>
        </div>
        {document.access_level !== AccessLevel.PUBLIC && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <CheckCircle className="h-3 w-3" />
            <span>{document.access_level} access</span>
          </div>
        )}
      </div>
    </div>
  );
}
