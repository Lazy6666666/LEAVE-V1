/**
 * Document Upload Validation Schemas
 * Using Zod for type-safe validation
 */

import { z } from "zod";

/**
 * Allowed file types for document upload
 */
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "image/png",
  "image/jpg",
  "image/jpeg",
  "image/gif",
] as const;

/**
 * Max file size: 10MB
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

/**
 * Document categories
 */
export const DOCUMENT_CATEGORIES = [
  "Policy",
  "Procedure",
  "Form",
  "Guidelines",
  "Manual",
  "Other",
] as const;

/**
 * Document Upload Metadata Schema
 */
export const documentUploadSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().max(1000, "Description is too long").optional(),
  category: z.enum(DOCUMENT_CATEGORIES, {
    errorMap: () => ({ message: "Invalid category" }),
  }),
  tags: z
    .array(z.string().min(1).max(50))
    .max(10, "Maximum 10 tags allowed")
    .optional()
    .default([]),
  expiry_date: z.string().datetime().optional(),
  access_level: z
    .enum(["PUBLIC", "EMPLOYEE", "MANAGER", "ADMIN", "HR"])
    .default("PUBLIC"),
});

export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;

/**
 * Document Query Schema
 */
export const documentQuerySchema = z.object({
  category: z.enum(DOCUMENT_CATEGORIES).optional(),
  tags: z.string().optional(), // Comma-separated tags
  search: z.string().optional(),
  access_level: z
    .enum(["PUBLIC", "EMPLOYEE", "MANAGER", "ADMIN", "HR"])
    .optional(),
  limit: z.number().int().positive().max(100).optional().default(50),
  offset: z.number().int().nonnegative().optional().default(0),
});

export type DocumentQuery = z.infer<typeof documentQuerySchema>;

/**
 * Validate file type
 */
export function isValidFileType(mimeType: string): boolean {
  return ALLOWED_FILE_TYPES.includes(mimeType as any);
}

/**
 * Validate file size
 */
export function isValidFileSize(size: number): boolean {
  return size > 0 && size <= MAX_FILE_SIZE;
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  // Remove any path separators and special characters
  return filename
    .replace(/[\/\\]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .substring(0, 255); // Limit length
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? `.${parts[parts.length - 1]}` : "";
}
