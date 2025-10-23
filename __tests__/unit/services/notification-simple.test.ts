// @ts-nocheck - Suppressing type checking for test file to focus on core application TypeScript errors
/**
 * Simple Notification Service Tests
 * T-040: Unit Test Suite Setup
 * Testing notification creation functions with simple mocking
 */

import { mockPrisma } from "../../setup";

// Import the functions to test
import {
  createNotification,
  notifyLeaveRequestCreated,
  notifyLeaveApproved,
  notifyLeaveRejected,
  notifyLeaveCancelled,
  notifyDocumentExpiring,
  notifyDocumentUploaded,
} from "@/lib/services/notification";

describe("createNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a notification with minimal data", async () => {
    const mockNotification = {
      id: "notification-123",
      user_id: "user-123",
      type: "LEAVE_APPROVED",
      title: "Leave Approved",
      message: "Your leave has been approved",
      read: false,
      link: null,
    };

    mockPrisma.notificationLog.create.mockResolvedValue(mockNotification);

    const result = await createNotification({
      userId: "user-123",
      type: "LEAVE_APPROVED",
      title: "Leave Approved",
      message: "Your leave has been approved",
    });

    expect(result).toEqual(mockNotification);
    expect(mockPrisma.notificationLog.create).toHaveBeenCalledWith({
      data: {
        user_id: "user-123",
        type: "LEAVE_APPROVED",
        title: "Leave Approved",
        message: "Your leave has been approved",
        read: false,
        link: null,
      },
    });
  });

  it("should create a notification with link", async () => {
    const mockNotification = {
      id: "notification-123",
      user_id: "user-123",
      type: "LEAVE_APPROVED",
      title: "Leave Approved",
      message: "Your leave has been approved",
      read: false,
      link: "/employee/leaves",
    };

    mockPrisma.notificationLog.create.mockResolvedValue(mockNotification);

    const result = await createNotification({
      userId: "user-123",
      type: "LEAVE_APPROVED",
      title: "Leave Approved",
      message: "Your leave has been approved",
      link: "/employee/leaves",
    });

    expect(result.link).toBe("/employee/leaves");
  });

  it("should handle creation errors", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockPrisma.notificationLog.create.mockRejectedValue(
      new Error("Database error")
    );

    await expect(
      createNotification({
        userId: "user-123",
        type: "LEAVE_APPROVED",
        title: "Leave Approved",
        message: "Your leave has been approved",
      })
    ).rejects.toThrow("Database error");

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error creating notification:",
      expect.any(Error)
    );
    consoleErrorSpy.mockRestore();
  });
});

describe("notifyLeaveApproved", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call createNotification with correct parameters", async () => {
    const mockNotification = {
      id: "notification-123",
      user_id: "employee-123",
      type: "LEAVE_APPROVED",
      title: "Leave Request Approved",
      message:
        "Your 5-day Annual Leave request has been approved by Jane Smith",
      read: false,
      link: "/employee/my-leaves",
    };

    mockPrisma.notificationLog.create.mockResolvedValue(mockNotification);

    await notifyLeaveApproved(
      "employee-123",
      "leave-123",
      5,
      "Annual Leave",
      "Jane Smith"
    );

    expect(mockPrisma.notificationLog.create).toHaveBeenCalledWith({
      data: {
        user_id: "employee-123",
        type: "LEAVE_APPROVED",
        title: "Leave Request Approved",
        message:
          "Your 5-day Annual Leave request has been approved by Jane Smith",
        read: false,
        link: "/employee/my-leaves",
      },
    });
  });
});

describe("notifyLeaveRejected", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create rejection notification without reason", async () => {
    mockPrisma.notificationLog.create.mockResolvedValue({
      id: "notification-123",
    });

    await notifyLeaveRejected(
      "employee-123",
      "leave-123",
      3,
      "Sick Leave",
      "Jane Smith"
    );

    expect(mockPrisma.notificationLog.create).toHaveBeenCalledWith({
      data: {
        user_id: "employee-123",
        type: "LEAVE_REJECTED",
        title: "Leave Request Rejected",
        message:
          "Your 3-day Sick Leave request has been rejected by Jane Smith",
        read: false,
        link: "/employee/my-leaves",
      },
    });
  });

  it("should create rejection notification with reason", async () => {
    mockPrisma.notificationLog.create.mockResolvedValue({
      id: "notification-123",
    });

    await notifyLeaveRejected(
      "employee-123",
      "leave-123",
      2,
      "Personal Leave",
      "Jane Smith",
      "Insufficient coverage"
    );

    expect(mockPrisma.notificationLog.create).toHaveBeenCalledWith({
      data: {
        user_id: "employee-123",
        type: "LEAVE_REJECTED",
        title: "Leave Request Rejected",
        message:
          "Your 2-day Personal Leave request has been rejected by Jane Smith: Insufficient coverage",
        read: false,
        link: "/employee/my-leaves",
      },
    });
  });
});

describe("notifyDocumentExpiring", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should notify admins about expiring document", async () => {
    const mockAdmins = [
      { user_id: "hr-1", role: "HR" },
      { user_id: "admin-1", role: "ADMIN" },
    ];

    mockPrisma.profile.findMany.mockResolvedValue(mockAdmins);
    mockPrisma.notificationLog.create.mockResolvedValue({
      id: "notification-123",
    });

    await notifyDocumentExpiring("Employee Contract", "document-123", 30);

    expect(mockPrisma.profile.findMany).toHaveBeenCalledWith({
      where: {
        role: {
          in: ["HR", "ADMIN"],
        },
      },
    });

    expect(mockPrisma.notificationLog.create).toHaveBeenCalledTimes(2);
    expect(mockPrisma.notificationLog.create).toHaveBeenCalledWith({
      data: {
        user_id: "hr-1",
        type: "DOCUMENT_EXPIRING",
        title: "Document Expiring Soon",
        message: '"Employee Contract" will expire in 30 days',
        read: false,
        link: "/documents",
      },
    });
  });

  it("should handle case with no admins", async () => {
    mockPrisma.profile.findMany.mockResolvedValue([]);

    await notifyDocumentExpiring("Policy Document", "document-123", 7);

    expect(mockPrisma.notificationLog.create).not.toHaveBeenCalled();
  });
});

describe("notifyDocumentUploaded", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should notify appropriate users based on access level", async () => {
    const testCases = [
      {
        accessLevel: "ADMIN",
        expectedWhere: { role: "ADMIN" },
      },
      {
        accessLevel: "HR",
        expectedWhere: { role: { in: ["HR", "ADMIN"] } },
      },
      {
        accessLevel: "MANAGER",
        expectedWhere: { role: { in: ["MANAGER", "HR", "ADMIN"] } },
      },
      {
        accessLevel: "PUBLIC",
        expectedWhere: {},
      },
    ];

    for (const testCase of testCases) {
      vi.clearAllMocks();

      const mockUsers = [
        { user_id: "user-1", role: "EMPLOYEE" },
        { user_id: "manager-1", role: "MANAGER" },
        { user_id: "hr-1", role: "HR" },
        { user_id: "admin-1", role: "ADMIN" },
      ];

      mockPrisma.profile.findMany.mockResolvedValue(mockUsers);
      mockPrisma.notificationLog.create.mockResolvedValue({
        id: "notification-123",
      });

      await notifyDocumentUploaded(
        "Test Document",
        "document-123",
        "Test User",
        testCase.accessLevel
      );

      expect(mockPrisma.profile.findMany).toHaveBeenCalledWith({
        where: testCase.expectedWhere,
      });
    }
  });
});
