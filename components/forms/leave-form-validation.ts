/**
 * Validation schemas for Leave Request Form using Zod
 */

import { z } from "zod";

// Base form schema
export const leaveFormBaseSchema = z.object({
  leave_type_id: z.string().min(1, "Please select a leave type"),

  start_date: z.date(),

  end_date: z.date(),

  reason: z
    .string()
    .max(500, "Reason must be less than 500 characters")
    .optional(),
});

// Step 1: Leave Type and Dates Schema
export const leaveTypeAndDatesSchema = leaveFormBaseSchema
  .pick({
    leave_type_id: true,
    start_date: true,
    end_date: true,
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: "End date must be after or equal to start date",
    path: ["end_date"],
  })
  .refine(
    (data) => data.start_date >= new Date(new Date().setHours(0, 0, 0, 0)),
    {
      message: "Start date cannot be in the past",
      path: ["start_date"],
    }
  );

// Step 2: Reason Schema
export const reasonSchema = z.object({
  reason: z
    .string()
    .min(10, "Please provide a reason with at least 10 characters")
    .max(500, "Reason must be less than 500 characters"),
});

// Step 3: Emergency Contact Schema
export const emergencyContactSchema = z.object({
  emergency_contact: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z
      .string()
      .regex(/^[+]?[\d\s\-()]{10,}$/, "Please enter a valid phone number"),
    email: z.string().email("Please enter a valid email address"),
  }),
});

// Step 4: Attachments Schema (optional)
export const attachmentsSchema = z.object({
  attachments: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        size: z.number(),
        type: z.string(),
      })
    )
    .optional(),
});

// Complete form schema
export const leaveFormCompleteSchema = leaveFormBaseSchema
  .and(reasonSchema)
  .and(emergencyContactSchema)
  .and(attachmentsSchema);

// File upload validation
export const fileUploadSchema = z
  .object({
    file: z.instanceof(File),
  })
  .refine(
    (data) => data.file.size <= 5 * 1024 * 1024, // 5MB
    {
      message: "File size must be less than 5MB",
    }
  )
  .refine(
    (data) => {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
        "image/gif",
      ];
      return allowedTypes.includes(data.file.type);
    },
    {
      message: "File must be PDF, Word document, or image (JPEG, PNG, GIF)",
    }
  );

// Type exports
export type LeaveFormBaseValues = z.infer<typeof leaveFormBaseSchema>;
export type LeaveTypeAndDatesValues = z.infer<typeof leaveTypeAndDatesSchema>;
export type ReasonValues = z.infer<typeof reasonSchema>;
export type EmergencyContactValues = z.infer<typeof emergencyContactSchema>;
export type AttachmentsValues = z.infer<typeof attachmentsSchema>;
export type LeaveFormCompleteValues = z.infer<typeof leaveFormCompleteSchema>;
export type FileUploadValues = z.infer<typeof fileUploadSchema>;
