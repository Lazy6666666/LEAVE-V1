"use client";

/**
 * NotificationPreferences Component
 * Allow users to manage their notification preferences
 */

import React, { useState } from "react";
import { Bell, Mail, Settings, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { NotificationType } from "@/lib/types/notification";

interface NotificationPreferences {
  inAppEnabled: boolean;
  emailEnabled: boolean;
  types: {
    [key in NotificationType]: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const defaultPreferences: NotificationPreferences = {
  inAppEnabled: true,
  emailEnabled: true,
  types: {
    LEAVE_CREATED: true,
    LEAVE_APPROVED: true,
    LEAVE_REQUEST_PENDING: true,
    LEAVE_REJECTED: true,
    LEAVE_CANCELLED: true,
    DOCUMENT_UPLOADED: true,
    DOCUMENT_EXPIRING: true,
    DOCUMENT_EXPIRED: true,
    DOCUMENT_DELETED: true,
    SYSTEM_ANNOUNCEMENT: true,
    ROLE_CHANGED: false,
  },
  quietHours: {
    enabled: false,
    start: "22:00",
    end: "08:00",
  },
};

const notificationTypeLabels: Record<NotificationType, string> = {
  LEAVE_CREATED: "Leave Created",
  LEAVE_APPROVED: "Leave Approved",
  LEAVE_REQUEST_PENDING: "New Leave Requests",
  LEAVE_REJECTED: "Leave Rejected",
  LEAVE_CANCELLED: "Leave Cancelled",
  DOCUMENT_UPLOADED: "Document Uploaded",
  DOCUMENT_EXPIRING: "Document Expiring Soon",
  DOCUMENT_EXPIRED: "Document Expired",
  DOCUMENT_DELETED: "Document Deleted",
  SYSTEM_ANNOUNCEMENT: "System Announcements",
  ROLE_CHANGED: "Role Changes",
};

export function NotificationPreferences() {
  const [preferences, setPreferences] =
    useState<NotificationPreferences>(defaultPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);

    try {
      // Save preferences to API
      const response = await fetch("/api/notifications/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error("Failed to save preferences");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving preferences:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTypeToggle = (type: NotificationType, checked: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: checked,
      },
    }));
  };

  const handleAllToggle = (checked: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      types: Object.keys(prev.types).reduce(
        (acc, key) => ({
          ...acc,
          [key]: checked,
        }),
        {}
      ) as NotificationPreferences["types"],
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose what notifications you want to receive and how
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notification Channels */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Notification Channels</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4" />
                <div>
                  <Label htmlFor="in-app">In-App Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Show notifications in the app
                  </p>
                </div>
              </div>
              <Switch
                id="in-app"
                checked={preferences.inAppEnabled}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, inAppEnabled: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4" />
                <div>
                  <Label htmlFor="email">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
              </div>
              <Switch
                id="email"
                checked={preferences.emailEnabled}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, emailEnabled: checked }))
                }
              />
            </div>
          </div>

          <Separator />

          {/* Notification Types */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Notification Types</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAllToggle(true)}
                >
                  All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAllToggle(false)}
                >
                  None
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              {Object.entries(notificationTypeLabels).map(([type, label]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={type}
                      checked={preferences.types[type as NotificationType]}
                      onCheckedChange={(checked) =>
                        handleTypeToggle(
                          type as NotificationType,
                          checked === true
                        )
                      }
                    />
                    <Label htmlFor={type} className="text-sm">
                      {label}
                    </Label>
                  </div>
                  {type === "LEAVE_REQUEST_PENDING" && (
                    <Badge variant="secondary">Manager</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Quiet Hours */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Quiet Hours</h3>
                <p className="text-xs text-muted-foreground">
                  Disable notifications during specific hours
                </p>
              </div>
              <Switch
                checked={preferences.quietHours.enabled}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({
                    ...prev,
                    quietHours: { ...prev.quietHours, enabled: checked },
                  }))
                }
              />
            </div>
            {preferences.quietHours.enabled && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="start-time">From</Label>
                  <input
                    id="start-time"
                    type="time"
                    value={preferences.quietHours.start}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        quietHours: {
                          ...prev.quietHours,
                          start: e.target.value,
                        },
                      }))
                    }
                    className="px-3 py-1 border rounded text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="end-time">To</Label>
                  <input
                    id="end-time"
                    type="time"
                    value={preferences.quietHours.end}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        quietHours: {
                          ...prev.quietHours,
                          end: e.target.value,
                        },
                      }))
                    }
                    className="px-3 py-1 border rounded text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Preferences"}
            </Button>
            {saved && (
              <div className="flex items-center gap-2 text-sm text-green-600 ml-4">
                <Check className="w-4 h-4" />
                Saved
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
