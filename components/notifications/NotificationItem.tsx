"use client";

/**
 * NotificationItem Component
 * Individual notification item displayed in the dropdown
 * Supports click-to-navigate and mark as read functionality
 */

import React from "react";
import { Clock, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Notification } from "@/lib/types/notification";

interface NotificationItemProps {
  notification: Notification;
  onRead?: (id: string) => void;
  className?: string;
}

export function NotificationItem({
  notification,
  onRead,
  className,
}: NotificationItemProps) {
  const handleClick = async () => {
    // Mark as read if callback provided
    if (onRead && !notification.read) {
      await onRead(notification.id);
    }

    // Navigate to link if available
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  const formatTimeAgo = (date: string | Date) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "LEAVE_REQUEST_PENDING":
      case "LEAVE_CREATED":
        return "📝";
      case "LEAVE_APPROVED":
        return "✅";
      case "LEAVE_REJECTED":
        return "❌";
      case "LEAVE_CANCELLED":
        return "🚫";
      case "DOCUMENT_EXPIRING":
        return "⏰";
      case "DOCUMENT_EXPIRED":
        return "📅";
      case "ROLE_CHANGED":
        return "👤";
      default:
        return "🔔";
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 hover:bg-accent/50 cursor-pointer transition-colors",
        !notification.read && "bg-accent/20 border-l-2 border-primary",
        className
      )}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className="flex-shrink-0 text-2xl">
        {getNotificationIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4
            className={cn(
              "text-sm font-medium",
              !notification.read && "font-semibold"
            )}
          >
            {notification.title}
          </h4>
          {!notification.read && (
            <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {notification.message}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <time dateTime={notification.created_at}>
              {formatTimeAgo(notification.created_at)}
            </time>
          </div>

          {notification.link && (
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Actions */}
      {!notification.read && (
        <Button
          variant="ghost"
          size="sm"
          className="flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onRead?.(notification.id);
          }}
        >
          <Check className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
