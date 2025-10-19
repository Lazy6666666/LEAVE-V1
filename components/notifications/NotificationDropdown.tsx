"use client";

/**
 * NotificationDropdown Component
 * T-036: Notification System Enhancement
 * Displays notification list in a dropdown with glassmorphism styling
 */

import React from "react";
import Link from "next/link";
import {
  CalendarPlus,
  CheckCircle,
  XCircle,
  CalendarX,
  FilePlus,
  AlertTriangle,
  AlertOctagon,
  FileX,
  Megaphone,
  Clock,
  LucideIcon,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils/date";
import {
  Notification,
  NotificationType,
  NotificationColors,
} from "@/lib/types/notification";

interface NotificationDropdownProps {
  notifications: Notification[];
  loading: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

const iconMap: Record<NotificationType, LucideIcon> = {
  LEAVE_CREATED: CalendarPlus,
  LEAVE_APPROVED: CheckCircle,
  LEAVE_REJECTED: XCircle,
  LEAVE_CANCELLED: CalendarX,
  DOCUMENT_UPLOADED: FilePlus,
  DOCUMENT_EXPIRING: AlertTriangle,
  DOCUMENT_EXPIRED: AlertOctagon,
  DOCUMENT_DELETED: FileX,
  SYSTEM_ANNOUNCEMENT: Megaphone,
  LEAVE_REQUEST_PENDING: Clock,
};

export function NotificationDropdown({
  notifications,
  loading,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationDropdownProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="w-96 p-4">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-96">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h3 className="font-semibold text-lg">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {unreadCount} unread
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllAsRead}
            className="text-xs"
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* Notification List */}
      <ScrollArea className="h-[400px]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <Megaphone className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No notifications</p>
            <p className="text-xs text-muted-foreground mt-1">
              You're all caught up!
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="border-t px-4 py-3">
        <Link href="/notifications">
          <Button variant="ghost" className="w-full" size="sm">
            View all notifications
          </Button>
        </Link>
      </div>
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
  const Icon = iconMap[notification.type];
  const colors = NotificationColors[notification.type];

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  const content = (
    <div
      className={cn(
        "flex gap-3 px-4 py-3 transition-colors cursor-pointer",
        !notification.read && "bg-blue-50/50",
        "hover:bg-muted/50"
      )}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className={cn("rounded-full p-2 h-fit", colors.bg)}>
        <Icon className={cn("h-4 w-4", colors.icon)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm font-medium leading-tight",
              !notification.read && "font-semibold"
            )}
          >
            {notification.title}
          </p>
          {!notification.read && (
            <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatRelativeTime(notification.created_at)}
        </p>
      </div>
    </div>
  );

  if (notification.link) {
    return <Link href={notification.link}>{content}</Link>;
  }

  return content;
}
