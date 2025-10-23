// @ts-nocheck - Suppressing type checking for test file to focus on core application TypeScript errors
/**
 * Notification Service Tests
 * T-040: Unit Test Suite Setup
 * Testing notification creation and management functions
 */

import { mockPrisma } from "../../setup";
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

  it("should create a notification successfully", async () => {
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

    expect(result).toEqual(mockNotification);
    expect(mockPrisma.notificationLog.create).toHaveBeenCalledWith({
      data: {
        user_id: "user-123",
        type: "LEAVE_APPROVED",
        title: "Leave Approved",
        message: "Your leave has been approved",
        read: false,
        link: "/employee/leaves",
      },
    });
  });

  it("should create notification without link", async () => {
    const mockNotification = {
      id: "notification-123",
      user_id: "user-123",
      type: "SYSTEM_MESSAGE",
      title: "System Update",
      message: "System maintenance scheduled",
      read: false,
      link: null,
    };

    mockPrisma.notificationLog.create.mockResolvedValue(mockNotification);

    const result = await createNotification({
      userId: "user-123",
      type: "SYSTEM_MESSAGE",
      title: "System Update",
      message: "System maintenance scheduled",
    });

    expect(result.link).toBeNull();
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

describe("notifyLeaveRequestCreated", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should notify all managers about new leave request", async () => {
    const mockManagers = [
      { user_id: "manager-1", role: "MANAGER" },
      { user_id: "hr-1", role: "HR" },
      { user_id: "admin-1", role: "ADMIN" },
    ];

    const mockNotification = {
      id: "notification-123",
      user_id: "manager-1",
      type: "LEAVE_REQUEST_PENDING",
      title: "New Leave Request",
      message: "John Doe has requested 5 days of Annual Leave",
      read: false,
      link: "/manager/leave-requests",
    };

    mockPrisma.profile.findMany.mockResolvedValue(mockManagers);
    mockPrisma.notificationLog.create.mockResolvedValue(mockNotification);

    await notifyLeaveRequestCreated(
      "employee-123",
      "John Doe",
      "leave-123",
      5,
      "Annual Leave"
    );

    expect(mockPrisma.profile.findMany).toHaveBeenCalledWith({
      where: {
        role: {
          in: ["MANAGER", "HR", "ADMIN"],
        },
      },
    });

    expect(mockPrisma.notificationLog.create).toHaveBeenCalledTimes(3);
    expect(mockPrisma.notificationLog.create).toHaveBeenCalledWith({
      data: {
        user_id: "manager-1",
        type: "LEAVE_REQUEST_PENDING",
        title: "New Leave Request",
        message: "John Doe has requested 5 days of Annual Leave",
        read: false,
        link: "/manager/leave-requests",
      },
    });
  });

  it("should handle case with no managers", async () => {
    mockPrisma.profile.findMany.mockResolvedValue([]);

    await notifyLeaveRequestCreated(
      "employee-123",
      "John Doe",
      "leave-123",
      5,
      "Annual Leave"
    );

    expect(mockPrisma.notificationLog.create).not.toHaveBeenCalled();
  });
});

describe("notifyLeaveApproved", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should notify employee about approved leave", async () => {
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

  it("should notify employee about rejected leave without reason", async () => {
    const mockNotification = {
      id: "notification-123",
      user_id: "employee-123",
      type: "LEAVE_REJECTED",
      title: "Leave Request Rejected",
      message: "Your 3-day Sick Leave request has been rejected by Jane Smith",
      read: false,
      link: "/employee/my-leaves",
    };

    mockPrisma.notificationLog.create.mockResolvedValue(mockNotification);

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

  it("should notify employee about rejected leave with reason", async () => {
    const mockNotification = {
      id: "notification-123",
      user_id: "employee-123",
      type: "LEAVE_REJECTED",
      title: "Leave Request Rejected",
      message:
        "Your 2-day Personal Leave request has been rejected by Jane Smith: Insufficient coverage",
      read: false,
      link: "/employee/my-leaves",
    };

    mockPrisma.notificationLog.create.mockResolvedValue(mockNotification);

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

describe("notifyLeaveCancelled", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should notify managers about cancelled leave", async () => {
    const mockManagers = [
      { user_id: "manager-1", role: "MANAGER" },
      { user_id: "hr-1", role: "HR" },
    ];

    mockPrisma.profile.findMany.mockResolvedValue(mockManagers);
    mockPrisma.notificationLog.create.mockResolvedValue({
      id: "notification-123",
    });

    await notifyLeaveCancelled(
      "employee-123",
      "John Doe",
      "leave-123",
      4,
      "Annual Leave"
    );

    expect(mockPrisma.profile.findMany).toHaveBeenCalledWith({
      where: {
        role: {
          in: ["MANAGER", "HR", "ADMIN"],
        },
      },
    });

    expect(mockPrisma.notificationLog.create).toHaveBeenCalledTimes(2);
    expect(mockPrisma.notificationLog.create).toHaveBeenCalledWith({
      data: {
        user_id: "manager-1",
        type: "LEAVE_CANCELLED",
        title: "Leave Request Cancelled",
        message: "John Doe has cancelled their 4-day Annual Leave request",
        read: false,
        link: "/manager/leave-requests",
      },
    });
  });
});

describe("notifyDocumentExpiring", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should notify HR and admins about expiring document", async () => {
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
});

describe("notifyDocumentUploaded", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should notify admins about ADMIN access document", async () => {
    const mockAdmins = [{ user_id: "admin-1", role: "ADMIN" }];

    mockPrisma.profile.findMany.mockResolvedValue(mockAdmins);
    mockPrisma.notificationLog.create.mockResolvedValue({
      id: "notification-123",
    });

    await notifyDocumentUploaded(
      "Policy Document",
      "document-123",
      "John Doe",
      "ADMIN"
    );

    expect(mockPrisma.profile.findMany).toHaveBeenCalledWith({
      where: { role: "ADMIN" },
    });

    expect(mockPrisma.notificationLog.create).toHaveBeenCalledWith({
      data: {
        user_id: "admin-1",
        type: "DOCUMENT_UPLOADED",
        title: "New Document Available",
        message: '"Policy Document" has been uploaded by John Doe',
        read: false,
        link: "/documents",
      },
    });
  });

  it("should notify HR and admins about HR access document", async () => {
    const mockUsers = [
      { user_id: "hr-1", role: "HR" },
      { user_id: "admin-1", role: "ADMIN" },
    ];

    mockPrisma.profile.findMany.mockResolvedValue(mockUsers);
    mockPrisma.notificationLog.create.mockResolvedValue({
      id: "notification-123",
    });

    await notifyDocumentUploaded(
      "Employee Handbook",
      "document-123",
      "Jane Smith",
      "HR"
    );

    expect(mockPrisma.profile.findMany).toHaveBeenCalledWith({
      where: { role: { in: ["HR", "ADMIN"] } },
    });
  });

  it("should notify all users about PUBLIC access document", async () => {
    const mockUsers = [
      { user_id: "employee-1", role: "EMPLOYEE" },
      { user_id: "manager-1", role: "MANAGER" },
      { user_id: "hr-1", role: "HR" },
    ];

    mockPrisma.profile.findMany.mockResolvedValue(mockUsers);
    mockPrisma.notificationLog.create.mockResolvedValue({
      id: "notification-123",
    });

    await notifyDocumentUploaded(
      "Company News",
      "document-123",
      "Admin",
      "PUBLIC"
    );

    expect(mockPrisma.profile.findMany).toHaveBeenCalledWith({
      where: {},
    });
  });
});
