/**
 * Audit Logs API
 * Provides access to audit log entries for admin users
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { auditLoginAttempt } from "@/lib/services/audit";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role
    const profile = await prisma.profile.findUnique({
      where: { user_id: user.id },
    });

    if (!profile || !["ADMIN", "HR"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      page = 1,
      limit = 20,
      searchTerm,
      actionFilter,
      entityFilter,
      dateFilter,
    } = body;

    // Build where clause
    const where: any = {};

    if (actionFilter && actionFilter !== "all") {
      where.action = actionFilter;
    }

    if (entityFilter && entityFilter !== "all") {
      where.entity_type = entityFilter;
    }

    if (searchTerm) {
      where.OR = [
        {
          user: {
            profile: {
              OR: [
                { full_name: { contains: searchTerm, mode: "insensitive" } },
                { email: { contains: searchTerm, mode: "insensitive" } },
              ],
            },
          },
        },
        { action: { contains: searchTerm, mode: "insensitive" } },
        { entity_type: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    if (dateFilter && dateFilter !== "all") {
      const now = new Date();
      let startDate: Date;

      switch (dateFilter) {
        case "today":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "quarter":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }

      where.created_at = {
        gte: startDate,
      };
    }

    // Get total count
    const totalCount = await prisma.auditLog.count({ where });

    // Get logs with pagination
    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          include: {
            profile: {
              select: {
                full_name: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    // Transform logs for frontend
    const transformedLogs = logs.map((log) => ({
      id: log.id,
      action: log.action,
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      old_values: log.old_values,
      new_values: log.new_values,
      ip_address: log.ip_address,
      user_agent: log.user_agent,
      created_at: log.created_at.toISOString(),
      user: log.user?.profile || null,
    }));

    // Log this access
    await auditLoginAttempt(
      user.id,
      true,
      request.ip,
      request.headers.get("user-agent") || undefined
    );

    return NextResponse.json({
      logs: transformedLogs,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      totalCount,
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // For backward compatibility, support GET requests
  return POST(request);
}
