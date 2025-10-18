// Calendar service for fetching and formatting calendar events

import prisma from "@/lib/prisma";
import {
  CalendarEvent,
  CalendarFilters,
  LEAVE_TYPE_COLORS,
} from "@/types/calendar";

/**
 * Get calendar events based on filters
 */
export async function getCalendarEvents(
  filters: CalendarFilters
): Promise<CalendarEvent[]> {
  const { userIds, leaveTypeIds, departments, startDate, endDate } = filters;

  // Build where clause
  const where: any = {
    status: "APPROVED",
  };

  // Date range filter
  if (startDate && endDate) {
    where.AND = [
      { start_date: { lte: new Date(endDate) } },
      { end_date: { gte: new Date(startDate) } },
    ];
  }

  // User filter
  if (userIds && userIds.length > 0) {
    where.user_id = { in: userIds };
  }

  // Leave type filter
  if (leaveTypeIds && leaveTypeIds.length > 0) {
    where.leave_type_id = { in: leaveTypeIds };
  }

  // Department filter
  if (departments && departments.length > 0) {
    where.user = {
      profile: {
        department: { in: departments },
      },
    };
  }

  // Fetch leaves with related data
  const leaves = await prisma.leave.findMany({
    where,
    include: {
      user: {
        include: {
          profile: {
            select: {
              full_name: true,
              avatar_url: true,
              department: true,
            },
          },
        },
      },
      leave_type: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      start_date: "asc",
    },
  });

  // Transform to calendar events
  return leaves.map((leave) => formatEventForCalendar(leave));
}

/**
 * Format a leave record into a calendar event
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatEventForCalendar(leave: any): CalendarEvent {
  const userName = leave.user?.profile?.full_name || "Unknown User";
  const leaveTypeName = leave.leave_type?.name || "Unknown";
  const leaveTypeColor =
    LEAVE_TYPE_COLORS[leaveTypeName] || LEAVE_TYPE_COLORS.Annual;

  return {
    id: leave.id,
    title: `${userName} - ${leaveTypeName}`,
    start: new Date(leave.start_date),
    end: new Date(leave.end_date),
    resource: {
      userId: leave.user_id,
      userName,
      userAvatar: leave.user?.profile?.avatar_url,
      leaveType: leaveTypeName,
      leaveTypeColor,
      daysCount: leave.days_count,
      status: "APPROVED",
      department: leave.user?.profile?.department,
    },
  };
}

/**
 * Get team members for filter dropdown
 */
export async function getTeamMembers(userId?: string) {
  const where: any = {};

  // If userId provided, filter by department
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          select: {
            department: true,
          },
        },
      },
    });

    if (user?.profile?.department) {
      where.profile = {
        department: user.profile.department,
      };
    }
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      profile: {
        select: {
          full_name: true,
          department: true,
        },
      },
    },
    orderBy: {
      profile: {
        full_name: "asc",
      },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return users.map((user: any) => ({
    id: user.id,
    name: user.profile?.full_name || user.email,
    department: user.profile?.department,
  }));
}

/**
 * Get unique departments
 */
export async function getDepartments(): Promise<string[]> {
  const profiles = await prisma.profile.findMany({
    where: {
      department: {
        not: null,
      },
    },
    select: {
      department: true,
    },
    distinct: ["department"],
  });

  return (
    profiles
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((p: any) => p.department)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((d: any): d is string => d !== null)
      .sort()
  );
}
