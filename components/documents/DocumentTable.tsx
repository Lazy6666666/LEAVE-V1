"use client";

/**
 * Document Table Component
 * T-023: Table view for documents
 */

import {
  Download,
  Eye,
  Edit2,
  Trash2,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  File,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import format from "date-fns/format";
import type { DocumentWithUploader } from "@/types/document";
// AccessLevel enum from Prisma
enum AccessLevel {
  PUBLIC = "PUBLIC",
  EMPLOYEE = "EMPLOYEE",
  MANAGER = "MANAGER",
  ADMIN = "ADMIN",
  HR = "HR",
}

interface DocumentTableProps {
  documents: DocumentWithUploader[];
  canEdit?: boolean;
  canDelete?: boolean;
  onDownload?: (id: string) => void;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

// Helper to get file icon
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

export function DocumentTable({
  documents,
  canEdit = false,
  canDelete = false,
  onDownload,
  onView,
  onEdit,
  onDelete,
}: DocumentTableProps) {
  if (documents.length === 0) {
    return (
      <div className="rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 p-12 text-center">
        <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No documents found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Try adjusting your filters or upload a new document
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Document
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Uploaded By
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {documents.map((document) => {
              const { icon: FileIcon, color: fileColor } = getFileIcon(
                document.file_name
              );
              const expiryStatus = getExpiryStatus(document.expiry_date);

              return (
                <tr
                  key={document.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  {/* Document */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${fileColor}15` }}
                      >
                        <FileIcon
                          className="h-5 w-5"
                          style={{ color: fileColor }}
                        />
                      </div>
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {document.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {document.file_name}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(document.category)}`}
                    >
                      {document.category}
                    </span>
                  </td>

                  {/* Uploaded By */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {document.uploader.profile?.full_name ||
                        document.uploader.email}
                    </div>
                    {document.access_level !== AccessLevel.PUBLIC && (
                      <div className="text-xs text-gray-500">
                        {document.access_level}
                      </div>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(document.created_at), "MMM d, yyyy")}
                  </td>

                  {/* Size */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatFileSize(document.file_size)}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {expiryStatus ? (
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium ${
                          expiryStatus.status === "expired"
                            ? "text-red-600 dark:text-red-400"
                            : "text-yellow-600 dark:text-yellow-400"
                        }`}
                      >
                        {expiryStatus.status === "expired" ? (
                          <>
                            <AlertTriangle className="h-3 w-3" />
                            Expired
                          </>
                        ) : (
                          <>
                            <Calendar className="h-3 w-3" />
                            {expiryStatus.days}d
                          </>
                        )}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {onView && (
                        <button
                          onClick={() => onView(document.id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      )}
                      {onDownload && (
                        <button
                          onClick={() => onDownload(document.id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      )}
                      {canEdit && onEdit && (
                        <button
                          onClick={() => onEdit(document.id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      )}
                      {canDelete && onDelete && (
                        <button
                          onClick={() => onDelete(document.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
