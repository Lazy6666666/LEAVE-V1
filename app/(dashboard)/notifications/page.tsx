"use client";

/**
 * Notifications Page
 * T-036: Notification System Enhancement
 * Full notifications page with filtering, search, and bulk actions
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  CheckCircle,
  Search,
  ChevronDown,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { SkeletonList } from "@/components/ui/enhanced-skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils/date";
import {
  Notification,
  NotificationType,
  NotificationColors,
} from "@/lib/types/notification";
import {
  CalendarPlus,
  CheckCircle as CheckCircleIcon,
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
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const iconMap: Record<NotificationType, LucideIcon> = {
  LEAVE_CREATED: CalendarPlus,
  LEAVE_APPROVED: CheckCircleIcon,
  LEAVE_REJECTED: XCircle,
  LEAVE_CANCELLED: CalendarX,
  DOCUMENT_UPLOADED: FilePlus,
  DOCUMENT_EXPIRING: AlertTriangle,
  DOCUMENT_EXPIRED: AlertOctagon,
  DOCUMENT_DELETED: FileX,
  SYSTEM_ANNOUNCEMENT: Megaphone,
  LEAVE_REQUEST_PENDING: Clock,
  ROLE_CHANGED: UserCheck,
};

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "LEAVE_CREATED", label: "Leave Created" },
  { value: "LEAVE_APPROVED", label: "Leave Approved" },
  { value: "LEAVE_REJECTED", label: "Leave Rejected" },
  { value: "LEAVE_CANCELLED", label: "Leave Cancelled" },
  { value: "DOCUMENT_UPLOADED", label: "Document Uploaded" },
  { value: "DOCUMENT_EXPIRING", label: "Document Expiring" },
  { value: "DOCUMENT_EXPIRED", label: "Document Expired" },
  { value: "SYSTEM_ANNOUNCEMENT", label: "Announcements" },
];

const readStatusOptions = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread Only" },
  { value: "read", label: "Read Only" },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<
    Notification[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [readStatusFilter, setReadStatusFilter] = useState("all");
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (append = false) => {
      try {
        const offset = append ? notifications.length : 0;
        const response = await fetch(
          `/api/notifications?limit=50&offset=${offset}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }

        const data = await response.json();

        if (append) {
          setNotifications((prev) => [...prev, ...data.notifications]);
        } else {
          setNotifications(data.notifications);
        }

        setHasMore(data.notifications.length === 50);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [notifications.length]
  );

  // Load more notifications
  const loadMore = () => {
    setLoadingMore(true);
    fetchNotifications(true);
  };

  // Filter and search notifications
  useEffect(() => {
    let filtered = [...notifications];

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((n) => n.type === typeFilter);
    }

    // Apply read status filter
    if (readStatusFilter === "unread") {
      filtered = filtered.filter((n) => !n.read);
    } else if (readStatusFilter === "read") {
      filtered = filtered.filter((n) => n.read);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query)
      );
    }

    setFilteredNotifications(filtered);
  }, [notifications, typeFilter, readStatusFilter, searchQuery]);

  // Mark selected as read
  const markSelectedAsRead = async () => {
    const promises = Array.from(selectedIds).map((id) =>
      fetch(`/api/notifications/${id}/read`, { method: "PATCH" })
    );

    await Promise.all(promises);

    setNotifications((prev) =>
      prev.map((n) => (selectedIds.has(n.id) ? { ...n, read: true } : n))
    );
    setSelectedIds(new Set());
  };

  // Mark single as read
  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Toggle selection
  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredNotifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNotifications.map((n) => n.id)));
    }
  };

  // Set up real-time updates
  useEffect(() => {
    fetchNotifications();

    const supabase = createClient();

    const channel = supabase
      .channel("notification_page_updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notification_logs",
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <main id="main-content" className="container mx-auto p-6 max-w-5xl">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" aria-hidden="true" />
            Notifications
          </h1>
          <p
            className="text-muted-foreground mt-1"
            role="status"
            aria-live="polite"
          >
            {unreadCount > 0
              ? `${unreadCount} unread notifications`
              : "All caught up!"}
          </p>
        </div>
      </header>

      {/* Filters and Search */}
      <section
        aria-label="Notification filters"
        className="bg-white rounded-lg border p-4 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <label htmlFor="notification-search" className="sr-only">
              Search notifications
            </label>
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="notification-search"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              aria-label="Search notifications by title or message"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label htmlFor="type-filter" className="sr-only">
              Filter by notification type
            </label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger
                id="type-filter"
                aria-label="Filter notifications by type"
              >
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Read Status Filter */}
          <div>
            <label htmlFor="status-filter" className="sr-only">
              Filter by read status
            </label>
            <Select
              value={readStatusFilter}
              onValueChange={setReadStatusFilter}
            >
              <SelectTrigger
                id="status-filter"
                aria-label="Filter notifications by read status"
              >
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {readStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div
            className="mt-4 flex items-center gap-4 p-3 bg-blue-50 rounded-md"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm font-medium">
              {selectedIds.size} notification{selectedIds.size !== 1 ? "s" : ""}{" "}
              selected
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={markSelectedAsRead}
              className="gap-2"
              aria-label={`Mark ${selectedIds.size} selected notifications as read`}
            >
              <CheckCircle className="h-4 w-4" aria-hidden="true" />
              Mark as read
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedIds(new Set())}
              aria-label="Clear notification selection"
            >
              Clear selection
            </Button>
          </div>
        )}
      </section>

      {/* Notifications List */}
      <section
        aria-label="Notifications list"
        className="bg-white rounded-lg border overflow-hidden"
      >
        {loading ? (
          <SkeletonList items={5} showAvatar={true} className="divide-y" />
        ) : filteredNotifications.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            role="status"
          >
            <div className="rounded-full bg-muted p-4 mb-4">
              <Bell
                className="h-8 w-8 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <h2 className="text-lg font-semibold mb-1">
              No notifications found
            </h2>
            <p className="text-sm text-muted-foreground">
              {searchQuery || typeFilter !== "all" || readStatusFilter !== "all"
                ? "Try adjusting your filters"
                : "You don't have any notifications yet"}
            </p>
          </div>
        ) : (
          <>
            {/* Select All */}
            <div className="border-b p-4 bg-gray-50 flex items-center gap-3">
              <Checkbox
                checked={
                  selectedIds.size === filteredNotifications.length &&
                  filteredNotifications.length > 0
                }
                onCheckedChange={toggleSelectAll}
                aria-label={
                  selectedIds.size === filteredNotifications.length &&
                  filteredNotifications.length > 0
                    ? "Deselect all notifications"
                    : "Select all notifications"
                }
              />
              <span className="text-sm font-medium">
                {selectedIds.size === filteredNotifications.length &&
                filteredNotifications.length > 0
                  ? "Deselect all"
                  : "Select all"}
              </span>
            </div>

            {/* Notifications */}
            <div className="divide-y max-h-[600px] overflow-y-auto" role="list">
              {filteredNotifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  selected={selectedIds.has(notification.id)}
                  onToggleSelect={toggleSelection}
                  onMarkAsRead={markAsRead}
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="border-t p-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="gap-2"
                  aria-label="Load more notifications"
                >
                  {loadingMore ? "Loading..." : "Load more"}
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

interface NotificationRowProps {
  notification: Notification;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onMarkAsRead: (id: string) => void;
}

function NotificationRow({
  notification,
  selected,
  onToggleSelect,
  onMarkAsRead,
}: NotificationRowProps) {
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
        "p-4 flex gap-4 transition-colors",
        !notification.read && "bg-blue-50/30",
        "hover:bg-muted/30 cursor-pointer"
      )}
      onClick={handleClick}
      role="listitem"
      aria-label={`${notification.title}. ${notification.message}. ${notification.read ? "Read" : "Unread"}. ${formatRelativeTime(notification.created_at)}`}
    >
      {/* Checkbox */}
      <Checkbox
        checked={selected}
        onCheckedChange={() => onToggleSelect(notification.id)}
        onClick={(e) => e.stopPropagation()}
        aria-label={`Select notification: ${notification.title}`}
      />

      {/* Icon */}
      <div
        className={cn("rounded-full p-2.5 h-fit", colors.bg)}
        aria-hidden="true"
      >
        <Icon className={cn("h-5 w-5", colors.icon)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p
              className={cn(
                "text-sm font-medium mb-1",
                !notification.read && "font-semibold"
              )}
            >
              {notification.title}
            </p>
            <p className="text-sm text-muted-foreground">
              {notification.message}
            </p>
          </div>
          {!notification.read && (
            <div
              className="h-2.5 w-2.5 rounded-full bg-blue-600 flex-shrink-0 mt-1"
              aria-label="Unread notification indicator"
              role="status"
            />
          )}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <p className="text-xs text-muted-foreground">
            <time dateTime={notification.created_at}>
              {formatRelativeTime(notification.created_at)}
            </time>
          </p>
          <Badge variant="outline" className="text-xs">
            {notification.type.replace(/_/g, " ").toLowerCase()}
          </Badge>
        </div>
      </div>
    </div>
  );

  if (notification.link) {
    return <Link href={notification.link}>{content}</Link>;
  }

  return content;
}
