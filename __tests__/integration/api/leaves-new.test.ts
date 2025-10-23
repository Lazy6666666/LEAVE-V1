/**
 * Leaves API Integration Tests
 * Testing the /api/leaves endpoint functionality
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST, GET } from "@/app/api/leaves/route";

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
    leave: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    profile: {
      findUnique: vi.fn(),
    },
    leaveType: {
      findUnique: vi.fn(),
    },
    notificationLog: {
      create: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/services/leave-balance", () => ({
  validateLeaveRequest: vi.fn(),
  checkOverlappingLeaves: vi.fn(),
  calculateWorkingDays: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import {
  validateLeaveRequest,
  checkOverlappingLeaves,
  calculateWorkingDays,
} from "@/lib/services/leave-balance";

const mockCreateClient = vi.mocked(createClient);
const mockPrisma = vi.mocked(prisma);
const mockValidateLeaveRequest = vi.mocked(validateLeaveRequest);
const mockCheckOverlappingLeaves = vi.mocked(checkOverlappingLeaves);
const mockCalculateWorkingDays = vi.mocked(calculateWorkingDays);

describe("/api/leaves POST endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a leave request successfully", async () => {
    // Mock authentication
    const mockUser = { id: "user-123" };
    mockCreateClient().auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Mock profile
    mockPrisma.profile.findUnique.mockResolvedValue({
      user_id: "user-123",
      role: "EMPLOYEE",
    });

    // Mock validation
    mockValidateLeaveRequest.mockResolvedValue({
      isValid: true,
      availableBalance: 15,
    });

    mockCheckOverlappingLeaves.mockResolvedValue(false);
    mockCalculateWorkingDays.mockReturnValue(5);

    // Mock created leave
    const mockLeave = {
      id: "leave-123",
      user_id: "user-123",
      leave_type_id: "type-123",
      start_date: new Date("2024-02-01"),
      end_date: new Date("2024-02-05"),
      days_count: 5,
      status: "PENDING",
      reason: "Medical appointment",
      leave_type: { name: "Sick Leave" },
    };

    mockPrisma.leave.create.mockResolvedValue(mockLeave);
    mockPrisma.notificationLog.create.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});

    // Create mock request
    const request = new NextRequest("http://localhost:3000/api/leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leave_type_id: "type-123",
        start_date: "2024-02-01T09:00:00Z",
        end_date: "2024-02-05T17:00:00Z",
        reason: "Medical appointment",
        days_count: 5,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe("Leave request created successfully");
    expect(data.leave).toEqual(mockLeave);

    expect(mockValidateLeaveRequest).toHaveBeenCalledWith(
      "user-123",
      "type-123",
      5,
      2024
    );
    expect(mockPrisma.leave.create).toHaveBeenCalledWith({
      data: {
        user_id: "user-123",
        leave_type_id: "type-123",
        start_date: new Date("2024-02-01T09:00:00Z"),
        end_date: new Date("2024-02-05T17:00:00Z"),
        days_count: 5,
        reason: "Medical appointment",
        status: "PENDING",
      },
      include: {
        leave_type: true,
      },
    });
  });

  it("should return 401 for unauthorized requests", async () => {
    mockCreateClient().auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Unauthorized" },
    });

    const request = new NextRequest("http://localhost:3000/api/leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leave_type_id: "type-123",
        start_date: "2024-02-01T09:00:00Z",
        end_date: "2024-02-05T17:00:00Z",
        days_count: 5,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 400 for invalid request body", async () => {
    const mockUser = { id: "user-123" };
    mockCreateClient().auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const request = new NextRequest("http://localhost:3000/api/leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // Missing required fields
        leave_type_id: "type-123",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
    expect(data.details).toBeDefined();
  });

  it("should return 409 for overlapping leave requests", async () => {
    const mockUser = { id: "user-123" };
    mockCreateClient().auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockCheckOverlappingLeaves.mockResolvedValue(true);
    mockCalculateWorkingDays.mockReturnValue(5);

    const request = new NextRequest("http://localhost:3000/api/leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leave_type_id: "type-123",
        start_date: "2024-02-01T09:00:00Z",
        end_date: "2024-02-05T17:00:00Z",
        days_count: 5,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe(
      "You have overlapping leave requests for these dates"
    );
  });

  it("should return 400 for insufficient leave balance", async () => {
    const mockUser = { id: "user-123" };
    mockCreateClient().auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockValidateLeaveRequest.mockResolvedValue({
      isValid: false,
      message:
        "Insufficient leave balance. Available: 2 days, Requested: 5 days",
      availableBalance: 2,
    });

    mockCheckOverlappingLeaves.mockResolvedValue(false);
    mockCalculateWorkingDays.mockReturnValue(5);

    const request = new NextRequest("http://localhost:3000/api/leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leave_type_id: "type-123",
        start_date: "2024-02-01T09:00:00Z",
        end_date: "2024-02-05T17:00:00Z",
        days_count: 5,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Insufficient leave balance");
    expect(data.availableBalance).toBe(2);
  });

  it("should handle server errors gracefully", async () => {
    const mockUser = { id: "user-123" };
    mockCreateClient().auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockValidateLeaveRequest.mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leave_type_id: "type-123",
        start_date: "2024-02-01T09:00:00Z",
        end_date: "2024-02-05T17:00:00Z",
        days_count: 5,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });
});

describe("/api/leaves GET endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch user leaves successfully for employee", async () => {
    const mockUser = { id: "user-123" };
    mockCreateClient().auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockPrisma.profile.findUnique.mockResolvedValue({
      user_id: "user-123",
      role: "EMPLOYEE",
    });

    const mockLeaves = [
      {
        id: "leave-1",
        start_date: new Date("2024-02-01"),
        end_date: new Date("2024-02-05"),
        days_count: 5,
        status: "PENDING",
        leave_type: { name: "Sick Leave" },
        user: {
          id: "user-123",
          email: "user@example.com",
          profile: { full_name: "John Doe" },
        },
      },
    ];

    mockPrisma.leave.findMany.mockResolvedValue(mockLeaves);
    mockPrisma.leave.count.mockResolvedValue(1);

    const request = new NextRequest(
      "http://localhost:3000/api/leaves?status=PENDING&limit=10&offset=0"
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.leaves).toEqual(mockLeaves);
    expect(data.total).toBe(1);
    expect(data.limit).toBe(10);
    expect(data.offset).toBe(0);

    expect(mockPrisma.leave.findMany).toHaveBeenCalledWith({
      where: {
        user_id: "user-123",
        status: "PENDING",
      },
      include: {
        leave_type: {
          select: {
            id: true,
            name: true,
            description: true,
            color: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                full_name: true,
                avatar_url: true,
                department: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      take: 10,
      skip: 0,
    });
  });

  it("should fetch all leaves for admin users", async () => {
    const mockUser = { id: "admin-123" };
    mockCreateClient().auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockPrisma.profile.findUnique.mockResolvedValue({
      user_id: "admin-123",
      role: "ADMIN",
    });

    mockPrisma.leave.findMany.mockResolvedValue([]);
    mockPrisma.leave.count.mockResolvedValue(0);

    const request = new NextRequest("http://localhost:3000/api/leaves");

    const response = await GET(request);

    expect(response.status).toBe(200);

    // Admin should not have user_id filter
    expect(mockPrisma.leave.findMany).toHaveBeenCalledWith({
      where: {},
      include: expect.any(Object),
      orderBy: {
        created_at: "desc",
      },
      take: undefined,
      skip: undefined,
    });
  });

  it("should return 401 for unauthorized requests", async () => {
    mockCreateClient().auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Unauthorized" },
    });

    const request = new NextRequest("http://localhost:3000/api/leaves");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 404 if profile not found", async () => {
    const mockUser = { id: "user-123" };
    mockCreateClient().auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockPrisma.profile.findUnique.mockResolvedValue(null);

    const request = new NextRequest("http://localhost:3000/api/leaves");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Profile not found");
  });

  it("should return 400 for invalid query parameters", async () => {
    const mockUser = { id: "user-123" };
    mockCreateClient().auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockPrisma.profile.findUnique.mockResolvedValue({
      user_id: "user-123",
      role: "EMPLOYEE",
    });

    const request = new NextRequest(
      "http://localhost:3000/api/leaves?limit=invalid"
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid query parameters");
    expect(data.details).toBeDefined();
  });

  it("should handle server errors gracefully", async () => {
    const mockUser = { id: "user-123" };
    mockCreateClient().auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockPrisma.profile.findUnique.mockRejectedValue(
      new Error("Database error")
    );

    const request = new NextRequest("http://localhost:3000/api/leaves");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });
});
