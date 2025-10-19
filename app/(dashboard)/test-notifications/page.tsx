"use client";

/**
 * Test Notifications Page
 * T-036: Notification System Enhancement
 * Development-only page for testing notification system
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NotificationType } from "@/lib/types/notification";
import { Bell, CheckCircle, AlertCircle } from "lucide-react";

const notificationTypes: NotificationType[] = [
  "LEAVE_CREATED",
  "LEAVE_APPROVED",
  "LEAVE_REJECTED",
  "LEAVE_CANCELLED",
  "LEAVE_REQUEST_PENDING",
  "DOCUMENT_UPLOADED",
  "DOCUMENT_EXPIRING",
  "DOCUMENT_EXPIRED",
  "DOCUMENT_DELETED",
  "SYSTEM_ANNOUNCEMENT",
];

export default function TestNotificationsPage() {
  const [selectedType, setSelectedType] =
    useState<NotificationType>("SYSTEM_ANNOUNCEMENT");
  const [title, setTitle] = useState("Test Notification");
  const [message, setMessage] = useState(
    "This is a test notification message"
  );
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const createTestNotification = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/test-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          title,
          message,
          link: link || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create notification");
      }

      setResult({
        type: "success",
        message: "Notification created successfully! Check the bell icon above.",
      });

      // Reset form
      setTitle("Test Notification");
      setMessage("This is a test notification message");
      setLink("");
    } catch (error) {
      setResult({
        type: "error",
        message: "Failed to create notification. Check console for details.",
      });
      console.error("Error creating notification:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickTests = [
    {
      type: "LEAVE_APPROVED" as NotificationType,
      title: "Leave Approved! 🎉",
      message: "Your 3-day Annual Leave has been approved by John Manager",
      link: "/employee/my-leaves",
    },
    {
      type: "LEAVE_REJECTED" as NotificationType,
      title: "Leave Request Rejected",
      message:
        "Your leave request has been rejected due to insufficient coverage",
      link: "/employee/my-leaves",
    },
    {
      type: "LEAVE_REQUEST_PENDING" as NotificationType,
      title: "New Leave Request",
      message: "Jane Doe has requested 5 days of Sick Leave",
      link: "/manager/leave-requests",
    },
    {
      type: "DOCUMENT_EXPIRING" as NotificationType,
      title: "Document Expiring Soon",
      message: "Company Policy Handbook will expire in 7 days",
      link: "/documents",
    },
    {
      type: "SYSTEM_ANNOUNCEMENT" as NotificationType,
      title: "System Maintenance",
      message: "Scheduled maintenance on Sunday, 2 AM - 4 AM",
      link: null,
    },
  ];

  const runQuickTest = async (test: typeof quickTests[0]) => {
    setSelectedType(test.type);
    setTitle(test.title);
    setMessage(test.message);
    setLink(test.link || "");

    // Small delay to show the form update
    setTimeout(() => {
      createTestNotification();
    }, 100);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <Bell className="h-8 w-8" />
          Test Notification System
        </h1>
        <p className="text-muted-foreground">
          Create test notifications to verify the system is working correctly
        </p>
      </div>

      {/* Quick Tests */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Quick Tests</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Click any button below to create a sample notification
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickTests.map((test, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => runQuickTest(test)}
              disabled={loading}
              className="justify-start text-left h-auto py-3"
            >
              <div className="flex-1">
                <div className="font-semibold text-sm">{test.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {test.message}
                </div>
                <Badge variant="outline" className="mt-2 text-xs">
                  {test.type}
                </Badge>
              </div>
            </Button>
          ))}
        </div>
      </Card>

      {/* Custom Notification Form */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Custom Notification</h2>

        <div className="space-y-4">
          {/* Type Selection */}
          <div>
            <Label htmlFor="type">Notification Type</Label>
            <Select
              value={selectedType}
              onValueChange={(value) =>
                setSelectedType(value as NotificationType)
              }
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {notificationTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
            />
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">Message</Label>
            <Input
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Notification message"
            />
          </div>

          {/* Link (Optional) */}
          <div>
            <Label htmlFor="link">Link (Optional)</Label>
            <Input
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="/path/to/page"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={createTestNotification}
            disabled={loading || !title || !message}
            className="w-full"
          >
            {loading ? "Creating..." : "Create Test Notification"}
          </Button>

          {/* Result Message */}
          {result && (
            <div
              className={`flex items-center gap-2 p-4 rounded-md ${
                result.type === "success"
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {result.type === "success" ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <p className="text-sm">{result.message}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-6 mt-6 bg-blue-50">
        <h3 className="font-semibold mb-2">Testing Instructions</h3>
        <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
          <li>Click a quick test button or fill in the custom form</li>
          <li>Watch the notification bell icon in the header</li>
          <li>The unread count badge should update immediately</li>
          <li>Click the bell to see the notification in the dropdown</li>
          <li>Open another browser tab and create a notification</li>
          <li>Both tabs should update in real-time! ⚡</li>
        </ol>
      </Card>

      {/* API Endpoint Info */}
      <Card className="p-6 mt-6">
        <h3 className="font-semibold mb-2">Need to create an API endpoint?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Create this file to enable the test endpoint:
        </p>
        <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
          {`// app/api/test-notification/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/services/notification";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    await createNotification({
      userId: user.id,
      type: body.type,
      title: body.title,
      message: body.message,
      link: body.link,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}`}
        </pre>
      </Card>
    </div>
  );
}
