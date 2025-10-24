// Calendar service for fetching and formatting calendar events
// Enhanced with performance optimizations and caching

import {
  CalendarEvent,
  CalendarFilters,
  LEAVE_TYPE_COLORS,
} from "@/types/calendar";

// Simple in-memory cache for calendar events (for development)
const calendarEventCache = new Map<
  string,
  { data: CalendarEvent[]; timestamp: number }
>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Generate cache key from filters
 */
function generateCacheKey(filters: CalendarFilters): string {
  const { userIds, leaveTypeIds, departments, startDate, endDate } = filters;
  return JSON.stringify({
    userIds: userIds?.sort() || [],
    leaveTypeIds: leaveTypeIds?.sort() || [],
    departments: departments?.sort() || [],
    startDate,
    endDate,
  });
}

/**
 * Get calendar events based on filters with caching
 */
export async function getCalendarEvents(
  filters: CalendarFilters
): Promise<CalendarEvent[]> {
  // Import Prisma dynamically
  const { prisma } = await import("@/lib/prisma");

  // Generate cache key
  const cacheKey = generateCacheKey(filters);

  // Check cache first (only in development or if explicitly enabled)
  if (
    process.env.NODE_ENV === "development" &&
    process.env.ENABLE_CALENDAR_CACHE === "true"
  ) {
    const cached = calendarEventCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  const { userIds, leaveTypeIds, departments, startDate, endDate } = filters;

  // Build where clause with optimized indexing
  const where: any = {
    status: "APPROVED",
  };

  // Date range filter - optimized for idx_leaves_dates index
  if (startDate && endDate) {
    where.AND = [
      { start_date: { lte: new Date(endDate) } },
      { end_date: { gte: new Date(startDate) } },
    ];
  }

  // User filter - optimized for idx_leaves_user_status index
  if (userIds && userIds.length > 0) {
    where.user_id = { in: userIds };
  }

  // Leave type filter
  if (leaveTypeIds && leaveTypeIds.length > 0) {
    where.leave_type_id = { in: leaveTypeIds };
  }

  // Department filter - use indexed department queries
  if (departments && departments.length > 0) {
    where.user = {
      profile: {
        department: { in: departments },
      },
    };
  }

  // Use read replica for dashboard queries if available
  // For now, just use the main prisma client
  const client = prisma;

  // Fetch leaves with optimized query to prevent N+1 problems
  const leaves = await client.leave.findMany({
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
    orderBy: [
      { start_date: "asc" }, // Uses idx_leaves_dates
      { created_at: "desc" }, // Uses idx_leaves_user_status_created_at
    ],
  });

  // Transform to calendar events
  const events = leaves.map((leave) => formatEventForCalendar(leave));

  // Cache results (only in development)
  if (
    process.env.NODE_ENV === "development" &&
    process.env.ENABLE_CALENDAR_CACHE === "true"
  ) {
    calendarEventCache.set(cacheKey, { data: events, timestamp: Date.now() });

    // Clean old cache entries periodically
    if (calendarEventCache.size > 100) {
      const now = Date.now();
      for (const [key, value] of calendarEventCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          calendarEventCache.delete(key);
        }
      }
    }
  }

  return events;
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
 * Get team members for filter dropdown with caching
 */
export async function getTeamMembers(userId?: string) {
  // Import Prisma dynamically
  const { prisma } = await import("@/lib/prisma");

  // Import Prisma dynamically
  const { prisma } = await import("@/lib/prisma");

  const where: any = {};

  // If userId provided, filter by department
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
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

  // Optimized query with selective fields and proper indexing
  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      profile: {
        select: {
          full_name: true,
          department: true,
        },
      },
    },
    orderBy: [
      { profile: { full_name: "asc" } }, // Uses profiles index
    ],
  });

  return users.map((user) => ({
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
