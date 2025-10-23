/**
 * Types for Leave Request Form
 */

export interface LeaveType {
  id: string;
  name: string;
  description?: string;
  annual_quota: number;
  color?: string;
  requires_documentation?: boolean;
  max_consecutive_days?: number;
}

export interface LeaveBalance {
  leave_type_id: string;
  leave_type_name: string;
  total_days: number;
  used_days: number;
  available_days: number;
  pending_days: number;
}

export interface ConflictInfo {
  has_conflicts: boolean;
  conflicts: Array<{
    date: string;
    type: "existing_leave" | "holiday" | "team_leave";
    description: string;
  }>;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  file?: File;
}

export interface LeaveFormData {
  leave_type_id: string;
  start_date: Date;
  end_date: Date;
  reason: string;
  attachments?: UploadedFile[];
  emergency_contact: {
    name: string;
    phone: string;
    email: string;
  };
}

export interface FormStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isValid: boolean;
}

export interface LeaveFormState {
  currentStep: number;
  formData: Partial<LeaveFormData>;
  steps: FormStep[];
  isSubmitting: boolean;
  conflicts: ConflictInfo | null;
  leaveBalance: LeaveBalance | null;
}
