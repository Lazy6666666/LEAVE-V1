// Calendar types for Team Calendar & Visibility

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: CalendarEventResource;
}

export interface CalendarEventResource {
  userId: string;
  userName: string;
  userAvatar?: string;
  leaveType: string;
  leaveTypeColor: string;
  daysCount: number;
  status: "APPROVED";
  department?: string;
}

export interface CalendarFilters {
  userIds?: string[];
  leaveTypeIds?: string[];
  departments?: string[];
  startDate?: string;
  endDate?: string;
}

export interface CalendarAPIResponse {
  events: CalendarEvent[];
  meta: {
    total: number;
    dateRange: {
      start: string;
      end: string;
    };
  };
}

export interface ConflictDetection {
  hasConflict: boolean;
  severity: "warning" | "blocking";
  threshold: number;
  conflictCount: number;
  conflicts: ConflictDetail[];
  message: string;
  canOverride: boolean;
}

export interface ConflictDetail {
  userId: string;
  userName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  overlapDays: number;
}

export interface ConflictCheckRequest {
  userId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  department?: string;
}

// Leave type colors mapping
export const LEAVE_TYPE_COLORS: Record<string, string> = {
  Annual: "#3B82F6", // Blue
  Sick: "#EF4444", // Red
  Personal: "#8B5CF6", // Purple
  Maternity: "#EC4899", // Pink
  Paternity: "#6366F1", // Indigo
  Study: "#F97316", // Orange
  Bereavement: "#6B7280", // Gray
  "Public Holiday": "#10B981", // Green
};
