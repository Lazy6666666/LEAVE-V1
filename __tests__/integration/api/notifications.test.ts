/**
 * Notifications API Integration Tests
 * Testing the /api/notifications endpoint functionality
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/notifications/route";

// Mock dependencies
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
  })),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    notificationLog: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const mockCreateClient = vi.mocked(createClient);
const mockPrisma = vi.mocked(prisma);

describe("/api/notifications GET endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch user notifications successfully", async () => {
    // Mock authentication
    const mockUser = { id: "user-123" };
    mockCreateClient().auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Mock notifications
    const mockNotifications = [
      {
        id: "notif-1",
        user_id: "user-123",
        type: "LEAVE_APPROVED",
        title: "Leave Approved",
        message: "Your leave request has been approved",
        read: false,
        created_at: new Date("2024-01-15T10:00:00Z"),
      },
      {
        id: "notif-2",
        user_id: "user-123",
        type: "LEAVE_REQUEST_PENDING",
        title: "New Leave Request",
        message: "A new leave request requires your approval",
        read: true,
        created_at: new Date("2024-01-14T15:30:00Z"),
      },
    ];

    mockPrisma.notificationLog.findMany.mockResolvedValue(mockNotifications);
    mockPrisma.notificationLog.count
      .mockResolvedValueOnce(2) // total count
      .mockResolvedValueOnce(1); // unread count

    const request = new NextRequest("http://localhost:3000/api/notifications");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.notifications).toEqual(mockNotifications);
    expect(data.total).toBe(2);
    expect(data.unreadCount).toBe(1);

    expect(mockPrisma.notificationLog.findMany).toHaveBeenCalledWith({
      where: { user_id: "user-123" },
      orderBy: { created_at: "desc" },
      take: 10,
      skip: 0,
    });

    expect(mockPrisma.notificationLog.count).toHaveBeenCalledWith({
      where: { user_id: "user-123" },
    });

    expect(mockPrisma.notificationLog.count).toHaveBeenCalledWith({
      where: { user_id: "user-123", read: false },
    });
  });

  it("should fetch unread notifications only", async () => {
    const mockUser = { id: "user-123" };
    mockCreateClient().auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const mockNotifications = [
      {
        id: "notif-1",
        user_id: "user-123",
        type: "LEAVE_APPROVED",
        title: "Leave Approved",
        message: "Your leave request has been approved",
        read: false,
        created_at: new Date("2024-01-15T10:00:00Z"),
      },
    ];

    mockPrisma.notificationLog.findMany.mockResolvedValue(mockNotifications);
    mockPrisma.notificationLog.count
      .mockResolvedValueOnce(1) // total unread count
      .mockResolvedValueOnce(1); // unread count

    const request = new NextRequest(
      "http://localhost:3000/api/notifications?unreadOnly=true"
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.notifications).toEqual(mockNotifications);
    expect(data.total).toBe(1);
    expect(data.unreadCount).toBe(1);

    expect(mockPrisma.notificationLog.findMany).toHaveBeenCalledWith({
      where: { user_id: "user-123", read: false },
      orderBy: { created_at: "desc" },
      take: 10,
      skip: 0,
    });
  });

  it("should fetch notifications by type", async () => {
    const mockUser = { id: "user-123" };
    mockCreateClient().auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const mockNotifications = [
      {
        id: "notif-1",
        user_id: "user-123",
        type: "LEAVE_APPROVED",
        title: "Leave Approved",
        message: "Your leave request has been approved",
        read: false,
        created_at: new Date("2024-01-15T10:00:00Z"),
      },
    ];

    mockPrisma.notificationLog.findMany.mockResolvedValue(mockNotifications);
    mockPrisma.notificationLog.count
      .mockResolvedValueOnce(1) // total count
      .mockResolvedValueOnce(1); // unread count

    const request = new NextRequest(
      "http://localhost:3000/api/notifications?type=LEAVE_APPROVED"
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.notifications).toEqual(mockNotifications);

    expect(mockPrisma.notificationLog.findMany).toHaveBeenCalledWith({
      where: { user_id: "user-123", type: "LEAVE_APPROVED" },
      orderBy: { created_at: "desc" },
      take: 10,
      skip: 0,
    });
  });

  it("should handle pagination correctly", async () => {
    const mockUser = { id: "user-123" };
    mockCreateClient().auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockPrisma.notificationLog.findMany.mockResolvedValue([]);
    mockPrisma.notificationLog.count
      .mockResolvedValueOnce(25) // total count
      .mockResolvedValueOnce(5); // unread count

    const request = new NextRequest(
      "http://localhost:3000/api/notifications?limit=5&offset=20"
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.notifications).toEqual([]);
    expect(data.total).toBe(25);
    expect(data.unreadCount).toBe(5);

    expect(mockPrisma.notificationLog.findMany).toHaveBeenCalledWith({
      where: { user_id: "user-123" },
      orderBy: { created_at: "desc" },
      take: 5,
      skip: 20,
    });
  });

  it("should handle combined filters", async () => {
    const mockUser = { id: "user-123" };
    mockCreateClient().auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockPrisma.notificationLog.findMany.mockResolvedValue([]);
    mockPrisma.notificationLog.count
      .mockResolvedValueOnce(0) // total count
      .mockResolvedValueOnce(0); // unread count

    const request = new NextRequest(
      "http://localhost:3000/api/notifications?unreadOnly=true&type=LEAVE_APPROVED&limit=3&offset=1"
    );

    const response = await GET(request);

    expect(response.status).toBe(200);

    expect(mockPrisma.notificationLog.findMany).toHaveBeenCalledWith({
      where: { user_id: "user-123", read: false, type: "LEAVE_APPROVED" },
      orderBy: { created_at: "desc" },
      take: 3,
      skip: 1,
    });
  });

  it("should return 401 for unauthorized requests", async () => {
    mockCreateClient().auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Unauthorized" },
    });

    const request = new NextRequest("http://localhost:3000/api/notifications");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
    expect(mockPrisma.notificationLog.findMany).not.toHaveBeenCalled();
  });

  it("should handle invalid limit and offset parameters gracefully", async () => {
    const mockUser = { id: "user-123" };
    mockCreateClient().auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockPrisma.notificationLog.findMany.mockResolvedValue([]);
    mockPrisma.notificationLog.count
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);

    const request = new NextRequest(
      "http://localhost:3000/api/notifications?limit=invalid&offset=invalid"
    );

    const response = await GET(request);

    expect(response.status).toBe(200);

    // parseInt('invalid') returns NaN, but the API should handle this gracefully
    // Default values should be used
    expect(mockPrisma.notificationLog.findMany).toHaveBeenCalledWith({
      where: { user_id: "user-123" },
      orderBy: { created_at: "desc" },
      take: 0, // parseInt('invalid') -> NaN -> default to 0
      skip: 0, // parseInt('invalid') -> NaN -> default to 0
    });
  });

  it("should handle database errors gracefully", async () => {
    const mockUser = { id: "user-123" };
    mockCreateClient().auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockPrisma.notificationLog.findMany.mockRejectedValue(
      new Error("Database connection failed")
    );

    const request = new NextRequest("http://localhost:3000/api/notifications");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });

  it("should handle empty notification list", async () => {
    const mockUser = { id: "user-123" };
    mockCreateClient().auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockPrisma.notificationLog.findMany.mockResolvedValue([]);
    mockPrisma.notificationLog.count
      .mockResolvedValueOnce(0) // total count
      .mockResolvedValueOnce(0); // unread count

    const request = new NextRequest("http://localhost:3000/api/notifications");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.notifications).toEqual([]);
    expect(data.total).toBe(0);
    expect(data.unreadCount).toBe(0);
  });
});
