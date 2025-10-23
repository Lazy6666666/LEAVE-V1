/**
 * Utility functions for Leave Request Form
 */

import {
  format,
  differenceInBusinessDays,
  addDays,
  isWeekend,
  isSameDay,
} from "date-fns";
import { LeaveType, ConflictInfo } from "./leave-form-types";

// Calculate working days between two dates (inclusive)
export function calculateWorkingDays(startDate: Date, endDate: Date): number {
  if (isSameDay(startDate, endDate)) {
    return isWeekend(startDate) ? 0 : 1;
  }

  const days = differenceInBusinessDays(addDays(endDate, 1), startDate);
  return Math.max(0, days);
}

// Format date range for display
export function formatDateRange(startDate: Date, endDate: Date): string {
  if (isSameDay(startDate, endDate)) {
    return format(startDate, "PPP");
  }

  return `${format(startDate, "PPP")} - ${format(endDate, "PPP")}`;
}

// Get date array for leave period
export function getDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  return dates;
}

// Check if date range conflicts with existing leaves
export function checkDateConflicts(
  startDate: Date,
  endDate: Date,
  existingLeaves: Array<{
    start_date: string;
    end_date: string;
    status: string;
  }>
): ConflictInfo {
  const conflicts = [];
  const leaveDates = getDateRange(startDate, endDate);

  for (const leaveDate of leaveDates) {
    // Check against existing leaves
    for (const existingLeave of existingLeaves) {
      const existingStart = new Date(existingLeave.start_date);
      const existingEnd = new Date(existingLeave.end_date);

      if (leaveDate >= existingStart && leaveDate <= existingEnd) {
        if (existingLeave.status !== "REJECTED") {
          conflicts.push({
            date: format(leaveDate, "yyyy-MM-dd"),
            type: "existing_leave" as const,
            description: `Existing leave request (${existingLeave.status})`,
          });
        }
      }
    }

    // Check if date is a weekend
    if (isWeekend(leaveDate)) {
      conflicts.push({
        date: format(leaveDate, "yyyy-MM-dd"),
        type: "holiday" as const,
        description: "Weekend (non-working day)",
      });
    }
  }

  return {
    has_conflicts: conflicts.length > 0,
    conflicts,
  };
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Validate file type
export function isValidFileType(
  file: File,
  allowedTypes: string[] = []
): boolean {
  const defaultAllowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/gif",
    "text/plain",
  ];

  const types = allowedTypes.length > 0 ? allowedTypes : defaultAllowedTypes;
  return types.includes(file.type);
}

// Generate unique file ID
export function generateFileId(): string {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Format leave type for display
export function formatLeaveType(leaveType: LeaveType): string {
  return `${leaveType.name} (${leaveType.annual_quota} days/year)`;
}

// Calculate leave duration text
export function getLeaveDurationText(days: number): string {
  if (days === 0) return "No working days";
  if (days === 1) return "1 working day";
  return `${days} working days`;
}

// Check if leave request exceeds available balance
export function exceedsBalance(
  workingDays: number,
  availableBalance: number
): boolean {
  return workingDays > availableBalance;
}

// Get leave balance status
export function getBalanceStatus(
  workingDays: number,
  availableBalance: number
): {
  status: "sufficient" | "warning" | "insufficient";
  message: string;
  color: string;
} {
  if (workingDays > availableBalance) {
    return {
      status: "insufficient",
      message: `Insufficient balance. You need ${workingDays} days but only have ${availableBalance} available.`,
      color: "text-destructive",
    };
  }

  if (availableBalance - workingDays < 2) {
    return {
      status: "warning",
      message: `Low balance. You will have ${availableBalance - workingDays} days remaining.`,
      color: "text-warning",
    };
  }

  return {
    status: "sufficient",
    message: `Sufficient balance. You will have ${availableBalance - workingDays} days remaining.`,
    color: "text-success",
  };
}

// Form validation helpers
export function validateStep(
  _step: number,
  formData: any,
  schema: any
): { isValid: boolean; errors: any } {
  try {
    schema.parse(formData);
    return { isValid: true, errors: null };
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      const zodError = error as any;
      const errors = zodError.issues?.reduce(
        (acc: any, err: any) => {
          acc[err.path.join(".")] = err.message;
          return acc;
        },
        {} as Record<string, string>
      );

      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: "Validation failed" } };
  }
}

// Format emergency contact for display
export function formatEmergencyContact(contact: {
  name: string;
  phone: string;
  email: string;
}): string {
  return `${contact.name} (${contact.phone}, ${contact.email})`;
}
