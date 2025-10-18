/**
 * Leave Request Validation Schemas
 * Using Zod for type-safe validation
 */

import { z } from "zod";

/**
 * Leave Request Creation Schema
 */
export const leaveRequestSchema = z
  .object({
    leave_type_id: z.string().uuid("Invalid leave type ID"),
    start_date: z.string().datetime("Invalid start date format"),
    end_date: z.string().datetime("Invalid end date format"),
    reason: z.string().optional(),
    days_count: z.number().positive("Days count must be positive"),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      return end >= start;
    },
    {
      message: "End date must be after or equal to start date",
      path: ["end_date"],
    }
  );

export type LeaveRequestInput = z.infer<typeof leaveRequestSchema>;

/**
 * Leave Status Update Schema
 */
export const leaveStatusUpdateSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "CANCELLED"]),
  manager_comment: z.string().optional(),
});

export type LeaveStatusUpdate = z.infer<typeof leaveStatusUpdateSchema>;

/**
 * Leave Approval Schema
 */
export const leaveApprovalSchema = z.object({
  manager_comment: z.string().optional(),
});

export type LeaveApproval = z.infer<typeof leaveApprovalSchema>;

/**
 * Leave Rejection Schema
 */
export const leaveRejectionSchema = z.object({
  manager_comment: z.string().min(1, "Rejection reason is required"),
});

export type LeaveRejection = z.infer<typeof leaveRejectionSchema>;

/**
 * Leave Query Filters Schema
 */
export const leaveQuerySchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  leave_type_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  limit: z.number().int().positive().max(100).optional().default(50),
  offset: z.number().int().nonnegative().optional().default(0),
});

export type LeaveQuery = z.infer<typeof leaveQuerySchema>;

/**
 * Leave Cancellation Schema
 */
export const leaveCancellationSchema = z.object({
  cancellation_reason: z.string().optional(),
});

export type LeaveCancellation = z.infer<typeof leaveCancellationSchema>;
