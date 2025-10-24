import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    // Import Prisma dynamically
    const { prisma } = await import("@/lib/prisma");

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type"); // leave, document, user, calendar
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!query.trim()) {
      return NextResponse.json({ results: [] });
    }

    const results = [];

    // Search leaves
    if (!type || type === "leave") {
      const leaves = await prisma.leave.findMany({
        where: {
          OR: [{ reason: { contains: query, mode: "insensitive" } }],
          user_id: user.id,
        },
        take: limit,
        include: {
          leave_type: true,
          user: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      });

      results.push(
        ...leaves.map((leave) => ({
          id: leave.id,
          type: "leave" as const,
          title: `${leave.leave_type.name} - ${leave.status}`,
          description: `${new Date(leave.start_date).toLocaleDateString()} - ${new Date(leave.end_date).toLocaleDateString()}`,
          url: `/employee/leaves`,
          metadata: {
            status: leave.status,
            days: leave.days_count,
          },
        }))
      );
    }

    // Search documents
    if (!type || type === "document") {
      const documents = await prisma.companyDocument.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
          ],
        },
        take: limit,
        orderBy: { created_at: "desc" },
      });

      results.push(
        ...documents.map((doc) => ({
          id: doc.id,
          type: "document" as const,
          title: doc.title,
          description: doc.description || doc.category,
          url: `/documents`,
          metadata: {
            category: doc.category,
            fileSize: doc.file_size,
          },
        }))
      );
    }

    // Search users (if admin/manager)
    if (!type || type === "user") {
      const profile = await prisma.profile.findUnique({
        where: { user_id: user.id },
      });

      if (
        profile?.role === "ADMIN" ||
        profile?.role === "HR" ||
        profile?.role === "MANAGER"
      ) {
        const users = await prisma.profile.findMany({
          where: {
            OR: [
              { full_name: { contains: query, mode: "insensitive" } },
              { department: { contains: query, mode: "insensitive" } },
            ],
          },
          take: limit,
          orderBy: { full_name: "asc" },
        });

        results.push(
          ...users.map((user) => ({
            id: user.id,
            type: "user" as const,
            title: user.full_name,
            description: `${user.department} - ${user.role}`,
            url: `/admin/users`,
            metadata: {
              role: user.role,
              department: user.department,
            },
          }))
        );
      }
    }

    // Search calendar events
    if (!type || type === "calendar") {
      const calendarEvents = await prisma.leave.findMany({
        where: {
          status: "APPROVED",
          OR: [
            {
              user: {
                profile: {
                  full_name: { contains: query, mode: "insensitive" },
                },
              },
            },
            { leave_type: { name: { contains: query, mode: "insensitive" } } },
          ],
        },
        take: limit,
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          leave_type: true,
        },
        orderBy: { start_date: "desc" },
      });

      results.push(
        ...calendarEvents.map((event) => ({
          id: event.id,
          type: "calendar" as const,
          title: `${event.user.profile?.full_name} - ${event.leave_type.name}`,
          description: `${new Date(event.start_date).toLocaleDateString()} - ${new Date(event.end_date).toLocaleDateString()}`,
          url: `/calendar`,
          metadata: {
            days: event.days_count,
            leaveType: event.leave_type.name,
          },
        }))
      );
    }

    // Sort results by relevance (simple approach: prioritize exact matches)
    const sortedResults = results.sort((a, b) => {
      const aExact = a.title.toLowerCase().includes(query.toLowerCase());
      const bExact = b.title.toLowerCase().includes(query.toLowerCase());
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    return NextResponse.json({
      results: sortedResults.slice(0, limit),
      total: sortedResults.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}
