/**
 * Notification Service
 * T-036: Notification System Enhancement
 * Helper functions for creating notifications
 */

import { prisma } from "@/lib/prisma";
import { NotificationType } from "@/lib/types/notification";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

/**
 * Create a notification for a user
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: CreateNotificationParams) {
  try {
    const notification = await prisma.notificationLog.create({
      data: {
        user_id: userId,
        type,
        title,
        message,
        read: false,
        link: link || null,
      },
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

/**
 * Create notification for leave request created (for managers)
 */
export async function notifyLeaveRequestCreated(
  employeeId: string,
  employeeName: string,
  leaveId: string,
  leaveDays: number,
  leaveType: string
) {
  // Get managers (for now, notify all HR and Admins)
  // TODO: Implement proper manager hierarchy
  const managers = await prisma.profile.findMany({
    where: {
      role: {
        in: ["MANAGER", "HR", "ADMIN"],
      },
    },
  });

  const notifications = managers.map((manager) =>
    createNotification({
      userId: manager.user_id,
      type: "LEAVE_REQUEST_PENDING",
      title: "New Leave Request",
      message: `${employeeName} has requested ${leaveDays} days of ${leaveType}`,
      link: `/manager/leave-requests`,
    })
  );

  await Promise.all(notifications);
}

/**
 * Notify employee when their leave is approved
 */
export async function notifyLeaveApproved(
  employeeId: string,
  leaveId: string,
  leaveDays: number,
  leaveType: string,
  approverName: string
) {
  await createNotification({
    userId: employeeId,
    type: "LEAVE_APPROVED",
    title: "Leave Request Approved",
    message: `Your ${leaveDays}-day ${leaveType} request has been approved by ${approverName}`,
    link: `/employee/my-leaves`,
  });
}

/**
 * Notify employee when their leave is rejected
 */
export async function notifyLeaveRejected(
  employeeId: string,
  leaveId: string,
  leaveDays: number,
  leaveType: string,
  approverName: string,
  reason?: string
) {
  await createNotification({
    userId: employeeId,
    type: "LEAVE_REJECTED",
    title: "Leave Request Rejected",
    message: `Your ${leaveDays}-day ${leaveType} request has been rejected by ${approverName}${reason ? `: ${reason}` : ""}`,
    link: `/employee/my-leaves`,
  });
}

/**
 * Notify managers when an employee cancels their leave
 */
export async function notifyLeaveCancelled(
  employeeId: string,
  employeeName: string,
  leaveId: string,
  leaveDays: number,
  leaveType: string
) {
  // Get managers
  const managers = await prisma.profile.findMany({
    where: {
      role: {
        in: ["MANAGER", "HR", "ADMIN"],
      },
    },
  });

  const notifications = managers.map((manager) =>
    createNotification({
      userId: manager.user_id,
      type: "LEAVE_CANCELLED",
      title: "Leave Request Cancelled",
      message: `${employeeName} has cancelled their ${leaveDays}-day ${leaveType} request`,
      link: `/manager/leave-requests`,
    })
  );

  await Promise.all(notifications);
}

/**
 * Notify users about document expiry
 */
export async function notifyDocumentExpiring(
  documentTitle: string,
  documentId: string,
  daysUntilExpiry: number
) {
  // Notify all HR and Admins
  const admins = await prisma.profile.findMany({
    where: {
      role: {
        in: ["HR", "ADMIN"],
      },
    },
  });

  const notifications = admins.map((admin) =>
    createNotification({
      userId: admin.user_id,
      type: "DOCUMENT_EXPIRING",
      title: "Document Expiring Soon",
      message: `"${documentTitle}" will expire in ${daysUntilExpiry} days`,
      link: `/documents`,
    })
  );

  await Promise.all(notifications);
}

/**
 * Notify users when a new document is uploaded
 */
export async function notifyDocumentUploaded(
  documentTitle: string,
  documentId: string,
  uploadedBy: string,
  accessLevel: string
) {
  // Notify based on access level
  let whereClause: any = {};

  if (accessLevel === "ADMIN") {
    whereClause = { role: "ADMIN" };
  } else if (accessLevel === "HR") {
    whereClause = { role: { in: ["HR", "ADMIN"] } };
  } else if (accessLevel === "MANAGER") {
    whereClause = { role: { in: ["MANAGER", "HR", "ADMIN"] } };
  } else {
    // PUBLIC or EMPLOYEE - notify all
    whereClause = {};
  }

  const users = await prisma.profile.findMany({
    where: whereClause,
  });

  const notifications = users.map((user) =>
    createNotification({
      userId: user.user_id,
      type: "DOCUMENT_UPLOADED",
      title: "New Document Available",
      message: `"${documentTitle}" has been uploaded by ${uploadedBy}`,
      link: `/documents`,
    })
  );

  await Promise.all(notifications);
}
