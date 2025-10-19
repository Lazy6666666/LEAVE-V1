// Team Calendar Page - View team leave schedule

import { createClient } from "@/lib/supabase/server";
import { getCalendarEvents, getDepartments } from "@/lib/services/calendar";
import prisma from "@/lib/prisma";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

const TeamCalendar = dynamic(() => import("@/components/calendar/TeamCalendar"), {
  loading: () => (
    <div className="rounded-lg border bg-card/50 backdrop-blur-sm p-4">
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[700px] w-full" />
      </div>
    </div>
  ),
  ssr: false,
});

export default async function CalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get initial calendar data (current month)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const initialEvents = await getCalendarEvents({
    startDate: startOfMonth.toISOString().split("T")[0],
    endDate: endOfMonth.toISOString().split("T")[0],
  });

  // Get leave types for filter
  const leaveTypes = await prisma.leaveType.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  // Get departments for filter
  const departments = await getDepartments();

  // Get team members for filter (same department as current user)
  const currentUserProfile = await prisma.profile.findUnique({
    where: { user_id: user.id },
    select: {
      department: true,
      full_name: true,
    },
  });

  const teamMembers = await prisma.user.findMany({
    where: currentUserProfile?.department
      ? {
          profile: {
            department: currentUserProfile.department,
          },
        }
      : {},
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

  return (
    <main id="main-content" className="container mx-auto p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Team Calendar</h1>
        <p className="text-muted-foreground">
          View team availability and plan leave requests
        </p>
      </header>

      <section aria-label="Team leave calendar and filters">
        <TeamCalendar
          initialEvents={initialEvents}
          leaveTypes={leaveTypes}
          departments={departments}
          teamMembers={teamMembers.map((member: any) => ({
            id: member.id,
            name: member.profile?.full_name || member.email,
            department: member.profile?.department || undefined,
          }))}
        />
      </section>
    </main>
  );
}
