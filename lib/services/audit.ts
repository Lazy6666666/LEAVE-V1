interface AuditLogParams {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog({
  // Import Prisma dynamically
  const { prisma } = await import("@/lib/prisma");

  userId,
  action,
  entityType,
  entityId,
  oldValues,
  newValues,
  ipAddress,
  userAgent,
}: AuditLogParams) {
  try {
    // Import Prisma dynamically
    const { prisma } = await import("@/lib/prisma");

    const auditLog = await prisma.auditLog.create({
      data: {
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        old_values: oldValues ? JSON.stringify(oldValues) : null,
        new_values: newValues ? JSON.stringify(newValues) : null,
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
        created_at: new Date(),
      },
    });

    return auditLog;
  } catch (error) {
    console.error("Error creating audit log:", error);
    // Don't throw error to avoid breaking the main flow
    // Audit logging should be non-blocking
    return null;
  }
}

/**
 * Audit leave request submission
 */
export async function auditLeaveSubmitted(
  userId: string,
  leaveId: string,
  leaveData: Record<string, any>
) {
  // Import Prisma dynamically
  const { prisma } = await import("@/lib/prisma");

  return createAuditLog({
    userId,
    action: "LEAVE_SUBMITTED",
    entityType: "leave",
    entityId: leaveId,
    newValues: {
      start_date: leaveData.startDate,
      end_date: leaveData.endDate,
      days_count: leaveData.daysCount,
      leave_type: leaveData.leaveTypeId,
      reason: leaveData.reason,
    },
  });
}

/**
 * Audit leave approval
 */
export async function auditLeaveApproved(
  userId: string, // Approver's ID
  leaveId: string,
  _leaveData: Record<string, any>
) {
  // Import Prisma dynamically
  const { prisma } = await import("@/lib/prisma");

  return createAuditLog({
    userId,
    action: "LEAVE_APPROVED",
    entityType: "leave",
    entityId: leaveId,
    newValues: {
      status: "APPROVED",
      approved_at: new Date().toISOString(),
      approved_by: userId,
    },
  });
}

/**
 * Audit leave rejection
 */
export async function auditLeaveRejected(
  userId: string, // Rejecter's ID
  leaveId: string,
  reason?: string
) {
  // Import Prisma dynamically
  const { prisma } = await import("@/lib/prisma");

  return createAuditLog({
    userId,
    action: "LEAVE_REJECTED",
    entityType: "leave",
    entityId: leaveId,
    newValues: {
      status: "REJECTED",
      rejected_at: new Date().toISOString(),
      rejected_by: userId,
      rejection_reason: reason,
    },
  });
}

/**
 * Audit leave cancellation
 */
export async function auditLeaveCancelled(
  userId: string,
  leaveId: string,
  previousStatus: string
) {
  // Import Prisma dynamically
  const { prisma } = await import("@/lib/prisma");

  return createAuditLog({
    userId,
    action: "LEAVE_CANCELLED",
    entityType: "leave",
    entityId: leaveId,
    oldValues: {
      previous_status: previousStatus,
    },
    newValues: {
      status: "CANCELLED",
      cancelled_at: new Date().toISOString(),
      cancelled_by: userId,
    },
  });
}

/**
 * Audit role change
 */
export async function auditRoleChanged(
  userId: string, // Admin's ID
  targetUserId: string, // User whose role is being changed
  oldRole: string,
  newRole: string
) {
  // Import Prisma dynamically
  const { prisma } = await import("@/lib/prisma");

  return createAuditLog({
    userId,
    action: "ROLE_ASSIGNED",
    entityType: "profile",
    entityId: targetUserId,
    oldValues: {
      previous_role: oldRole,
    },
    newValues: {
      new_role: newRole,
      changed_at: new Date().toISOString(),
      changed_by: userId,
    },
  });
}

/**
 * Audit document upload
 */
export async function auditDocumentUploaded(
  userId: string,
  documentId: string,
  documentData: Record<string, any>
) {
  // Import Prisma dynamically
  const { prisma } = await import("@/lib/prisma");

  return createAuditLog({
    userId,
    action: "DOCUMENT_UPLOADED",
    entityType: "document",
    entityId: documentId,
    newValues: {
      title: documentData.title,
      category: documentData.category,
      access_level: documentData.accessLevel,
      file_name: documentData.fileName,
      file_size: documentData.fileSize,
      uploaded_at: new Date().toISOString(),
    },
  });
}

/**
 * Audit document access
 */
export async function auditDocumentAccessed(
  userId: string,
  documentId: string,
  action: "VIEWED" | "DOWNLOADED" = "VIEWED"
) {
  // Import Prisma dynamically
  const { prisma } = await import("@/lib/prisma");

  return createAuditLog({
    userId,
    action: "DOCUMENT_ACCESSED",
    entityType: "document",
    entityId: documentId,
    newValues: {
      access_type: action,
      accessed_at: new Date().toISOString(),
    },
  });
}

/**
 * Audit document deletion
 */
export async function auditDocumentDeleted(
  userId: string,
  documentId: string,
  documentTitle: string
) {
  // Import Prisma dynamically
  const { prisma } = await import("@/lib/prisma");

  return createAuditLog({
    userId,
    action: "DOCUMENT_DELETED",
    entityType: "document",
    entityId: documentId,
    oldValues: {
      title: documentTitle,
      deleted_at: new Date().toISOString(),
      deleted_by: userId,
    },
  });
}

/**
 * Audit login attempt
 */
export async function auditLoginAttempt(
  userId: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string
) {
  // Import Prisma dynamically
  const { prisma } = await import("@/lib/prisma");

  return createAuditLog({
    userId,
    action: success ? "LOGIN_SUCCESS" : "LOGIN_FAILED",
    entityType: "user",
    entityId: userId,
    newValues: {
      login_attempt_at: new Date().toISOString(),
      success,
      ip_address: ipAddress,
      user_agent: userAgent,
    },
    ipAddress,
    userAgent,
  });
}

/**
 * Get audit logs for an entity
 */
export async function getAuditLogs(
  entityType: string,
  entityId: string,
  limit = 50
) {
  // Import Prisma dynamically
  const { prisma } = await import("@/lib/prisma");

  try {
    // Import Prisma dynamically
    const { prisma } = await import("@/lib/prisma");

    const logs = await prisma.auditLog.findMany({
      where: {
        entity_type: entityType,
        entity_id: entityId,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      take: limit,
    });

    return logs.map((log) => ({
      ...log,
      old_values: log.old_values ? JSON.parse(log.old_values) : null,
      new_values: log.new_values ? JSON.parse(log.new_values) : null,
      user: log.user?.profile || null,
    }));
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return [];
  }
}

/**
 * Get audit logs for a user
 */
export async function getUserAuditLogs(
  userId: string,
  limit = 100,
  offset = 0
) {
  // Import Prisma dynamically
  const { prisma } = await import("@/lib/prisma");

  try {
    // Import Prisma dynamically
    const { prisma } = await import("@/lib/prisma");

    const logs = await prisma.auditLog.findMany({
      where: {
        user_id: userId,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      take: limit,
      skip: offset,
    });

    return logs.map((log) => ({
      ...log,
      old_values: log.old_values ? JSON.parse(log.old_values) : null,
      new_values: log.new_values ? JSON.parse(log.new_values) : null,
      user: {
        profile: log.user?.profile || null,
        email: log.user?.email || null,
      },
    }));
  } catch (error) {
    console.error("Error fetching user audit logs:", error);
    return [];
  }
}
