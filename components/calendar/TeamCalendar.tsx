"use client";

// Team Calendar Component - Main calendar view with filters

import { useState, useCallback, useMemo, memo } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format } from "date-fns";
import { parse } from "date-fns";
import { startOfWeek } from "date-fns";
import { getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { CalendarEvent, ConflictDetection } from "@/types/calendar";
import CalendarFilters from "./CalendarFilters";
import CalendarEventComponent from "./CalendarEvent";
import ConflictWarning from "./ConflictWarning";
import TeamAvailability from "./TeamAvailability";
import { Users, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface TeamCalendarProps {
  initialEvents: CalendarEvent[];
  leaveTypes: { id: string; name: string }[];
  departments: string[];
  teamMembers: { id: string; name: string; department?: string }[];
}

function TeamCalendar({
  initialEvents,
  leaveTypes,
  departments,
  teamMembers,
}: TeamCalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());
  const [filters, setFilters] = useState({
    userIds: [] as string[],
    leaveTypeIds: [] as string[],
    departments: [] as string[],
  });
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [conflictDetection, setConflictDetection] =
    useState<ConflictDetection | null>(null);
  const [showAvailability, setShowAvailability] = useState(false);

  // Filter events based on selected filters
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Filter by user
      if (
        filters.userIds.length > 0 &&
        !filters.userIds.includes(event.resource.userId)
      ) {
        return false;
      }

      // Filter by department
      if (
        filters.departments.length > 0 &&
        event.resource.department &&
        !filters.departments.includes(event.resource.department)
      ) {
        return false;
      }

      return true;
    });
  }, [events, filters]);

  // Fetch events when date range changes
  const handleNavigate = useCallback(
    async (newDate: Date) => {
      setDate(newDate);

      // Calculate date range based on view
      const startDate = getStartDate(newDate, view);
      const endDate = getEndDate(newDate, view);

      try {
        const response = await fetch(
          `/api/calendar?start=${startDate.toISOString().split("T")[0]}&end=${endDate.toISOString().split("T")[0]}`
        );

        if (response.ok) {
          const data = await response.json();
          setEvents(
            data.events.map((event: any) => ({
              ...event,
              start: new Date(event.start),
              end: new Date(event.end),
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch calendar events:", error);
      }
    },
    [view]
  );

  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
  }, []);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    // Show event details modal
    console.log("Selected event:", event);
  }, []);

  const handleSelectSlot = useCallback(
    async ({ start, end }: { start: Date; end: Date }) => {
      setSelectedSlot({ start, end });

      // Check for conflicts on the selected date range
      try {
        const response = await fetch("/api/calendar/conflicts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: "current-user-id", // This would come from auth context
            leaveTypeId: leaveTypes[0]?.id || "1",
            startDate: start.toISOString().split("T")[0],
            endDate: end.toISOString().split("T")[0],
            department: filters.departments[0],
          }),
        });

        if (response.ok) {
          const conflictData: ConflictDetection = await response.json();
          setConflictDetection(conflictData);
        }
      } catch (error) {
        console.error("Failed to check conflicts:", error);
      }
    },
    [leaveTypes, filters.departments]
  );

  const clearConflictDetection = useCallback(() => {
    setConflictDetection(null);
    setSelectedSlot(null);
  }, []);

  // Calculate team availability for current date range
  const teamAvailability = useMemo(() => {
    const totalTeamMembers = teamMembers.length;
    const unavailableMembers = new Set(
      filteredEvents.map((event) => event.resource.userId)
    );
    const availableCount = totalTeamMembers - unavailableMembers.size;

    return {
      total: totalTeamMembers,
      available: availableCount,
      unavailable: unavailableMembers.size,
      percentage:
        totalTeamMembers > 0
          ? Math.round((availableCount / totalTeamMembers) * 100)
          : 0,
    };
  }, [filteredEvents, teamMembers]);

  return (
    <div className="space-y-4">
      {/* Conflict Detection Warning */}
      {conflictDetection && conflictDetection.hasConflict && (
        <ConflictWarning
          conflictDetection={conflictDetection}
          selectedSlot={selectedSlot}
          onClear={clearConflictDetection}
        />
      )}

      {/* Team Availability Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <CalendarFilters
            leaveTypes={leaveTypes}
            departments={departments}
            teamMembers={teamMembers}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>

        <div className="space-y-4">
          {/* Team Availability Card */}
          <div className="rounded-lg border bg-card/50 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Team Availability</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAvailability(!showAvailability)}
              >
                {showAvailability ? "Hide" : "Show"}
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Available</span>
                <span className="font-semibold text-green-600">
                  {teamAvailability.available}/{teamAvailability.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${teamAvailability.percentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {teamAvailability.percentage}% of team available
              </p>
            </div>
          </div>

          {/* Calendar View Info */}
          <div className="rounded-lg border bg-card/50 backdrop-blur-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Calendar Info</h3>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                View: <span className="font-medium capitalize">{view}</span>
              </p>
              <p>
                Events:{" "}
                <span className="font-medium">{filteredEvents.length}</span>
              </p>
              <p>
                Date:{" "}
                <span className="font-medium">{format(date, "MMM yyyy")}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Calendar */}
      <div className="rounded-lg border bg-card/50 backdrop-blur-sm p-4">
        <Calendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 700 }}
          view={view}
          onView={handleViewChange}
          date={date}
          onNavigate={handleNavigate}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          components={{
            event: CalendarEventComponent,
          }}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.resource.leaveTypeColor,
              border: "none",
              borderRadius: "6px",
              padding: "4px 8px",
              color: "white",
              fontSize: "12px",
              fontWeight: 500,
            },
          })}
          dayPropGetter={(date) => {
            const today = new Date();
            if (date.toDateString() === today.toDateString()) {
              return {
                style: {
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                },
              };
            }
            return {};
          }}
        />
      </div>

      {/* Team Availability Details */}
      {showAvailability && (
        <TeamAvailability
          events={filteredEvents}
          teamMembers={teamMembers}
          currentDate={date}
          view={view}
        />
      )}

      {/* Calendar Statistics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm text-muted-foreground bg-card/30 backdrop-blur-sm rounded-lg p-4">
        <div className="flex items-center gap-4">
          <span>Showing {filteredEvents.length} approved leave requests</span>
          {filters.userIds.length > 0 && (
            <span>• {filters.userIds.length} user(s) filtered</span>
          )}
          {filters.departments.length > 0 && (
            <span>• {filters.departments.length} department(s) filtered</span>
          )}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs">Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs">Unavailable</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions to calculate date ranges
function getStartDate(date: Date, view: View): Date {
  const year = date.getFullYear();
  const month = date.getMonth();

  switch (view) {
    case "month":
      return new Date(year, month, 1);
    case "week":
      return startOfWeek(date);
    case "day":
      return new Date(year, month, date.getDate());
    default:
      return new Date(year, month, 1);
  }
}

function getEndDate(date: Date, view: View): Date {
  const year = date.getFullYear();
  const month = date.getMonth();

  switch (view) {
    case "month":
      return new Date(year, month + 1, 0);
    case "week":
      const start = startOfWeek(date);
      return new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
    case "day":
      return new Date(year, month, date.getDate());
    default:
      return new Date(year, month + 1, 0);
  }
}

export default memo(TeamCalendar);
