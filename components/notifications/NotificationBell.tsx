"use client";

/**
 * NotificationBell Component
 * T-036: Notification System Enhancement
 * Bell icon with unread count badge and real-time updates
 */

import React, { useState, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationDropdown } from "./NotificationDropdown";
import { createClient } from "@/lib/supabase/client";
import { Notification } from "@/lib/types/notification";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/notifications?limit=10");

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark single notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }, []);

  // Set up Supabase Realtime subscription
  useEffect(() => {
    fetchNotifications();

    const supabase = createClient();

    // Subscribe to notification_logs table changes
    const channel = supabase
      .channel("notification_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notification_logs",
        },
        (payload) => {
          const newNotification = payload.new as Notification;

          // Only add if it's for the current user (will be filtered by RLS)
          setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]);

          if (!newNotification.read) {
            setUnreadCount((prev) => prev + 1);
          }

          // Optional: Play notification sound or show toast
          // You can add this functionality here
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notification_logs",
        },
        (payload) => {
          const updatedNotification = payload.new as Notification;

          setNotifications((prev) =>
            prev.map((n) =>
              n.id === updatedNotification.id ? updatedNotification : n
            )
          );

          // Recalculate unread count
          setNotifications((prev) => {
            const newUnreadCount = prev.filter((n) => !n.read).length;
            setUnreadCount(newUnreadCount);
            return prev;
          });
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Connected to notification updates");
        } else if (status === "CHANNEL_ERROR") {
          console.error("Error subscribing to notifications");
          setError("Real-time updates disconnected");
        } else if (status === "TIMED_OUT") {
          console.error("Subscription timed out");
          setError("Connection timeout");
        }
      });

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className={cn(
                "absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center px-1",
                "text-xs font-semibold rounded-full"
              )}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-96 p-0 bg-white/95 backdrop-blur-lg border shadow-xl"
        sideOffset={8}
      >
        {error && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-2">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}
        <NotificationDropdown
          notifications={notifications}
          loading={loading}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
        />
      </PopoverContent>
    </Popover>
  );
}
