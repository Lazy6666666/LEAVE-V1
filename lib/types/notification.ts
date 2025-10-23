/**
 * Notification Types and Interfaces
 * T-036: Notification System Enhancement
 */

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  created_at: string;
  createdAt: string; // Add this for compatibility
}

export type NotificationType =
  | "LEAVE_CREATED"
  | "LEAVE_APPROVED"
  | "LEAVE_REJECTED"
  | "LEAVE_CANCELLED"
  | "DOCUMENT_UPLOADED"
  | "DOCUMENT_EXPIRING"
  | "DOCUMENT_EXPIRED"
  | "DOCUMENT_DELETED"
  | "SYSTEM_ANNOUNCEMENT"
  | "LEAVE_REQUEST_PENDING" // For managers
  | "ROLE_CHANGED";

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

export interface NotificationFilter {
  type?: NotificationType;
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}

export const NotificationIcons: Record<NotificationType, string> = {
  LEAVE_CREATED: "calendar-plus",
  LEAVE_APPROVED: "check-circle",
  LEAVE_REJECTED: "x-circle",
  LEAVE_CANCELLED: "calendar-x",
  DOCUMENT_UPLOADED: "file-plus",
  DOCUMENT_EXPIRING: "alert-triangle",
  DOCUMENT_EXPIRED: "alert-octagon",
  DOCUMENT_DELETED: "file-x",
  SYSTEM_ANNOUNCEMENT: "megaphone",
  LEAVE_REQUEST_PENDING: "clock",
  ROLE_CHANGED: "user-check",
};

export const NotificationColors: Record<
  NotificationType,
  { bg: string; text: string; icon: string }
> = {
  LEAVE_CREATED: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    icon: "text-blue-600",
  },
  LEAVE_APPROVED: {
    bg: "bg-green-100",
    text: "text-green-800",
    icon: "text-green-600",
  },
  LEAVE_REJECTED: {
    bg: "bg-red-100",
    text: "text-red-800",
    icon: "text-red-600",
  },
  LEAVE_CANCELLED: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    icon: "text-orange-600",
  },
  DOCUMENT_UPLOADED: {
    bg: "bg-purple-100",
    text: "text-purple-800",
    icon: "text-purple-600",
  },
  DOCUMENT_EXPIRING: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    icon: "text-yellow-600",
  },
  DOCUMENT_EXPIRED: {
    bg: "bg-red-100",
    text: "text-red-800",
    icon: "text-red-600",
  },
  DOCUMENT_DELETED: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    icon: "text-gray-600",
  },
  SYSTEM_ANNOUNCEMENT: {
    bg: "bg-indigo-100",
    text: "text-indigo-800",
    icon: "text-indigo-600",
  },
  LEAVE_REQUEST_PENDING: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    icon: "text-amber-600",
  },
  ROLE_CHANGED: {
    bg: "bg-purple-100",
    text: "text-purple-800",
    icon: "text-purple-600",
  },
};
