"use client";

// Team Calendar Component - Main calendar view with filters

import { useState, useCallback, useMemo, memo } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import { enUS } from "date-fns/locale/en-US";
import { CalendarEvent } from "@/types/calendar";
import CalendarFilters from "./CalendarFilters";
import CalendarEventComponent from "./CalendarEvent";
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

  return (
    <div className="space-y-4">
      <CalendarFilters
        leaveTypes={leaveTypes}
        departments={departments}
        teamMembers={teamMembers}
        filters={filters}
        onFiltersChange={setFilters}
      />

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
          components={{
            event: CalendarEventComponent,
          }}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.resource.leaveTypeColor,
              border: "none",
              borderRadius: "6px",
              padding: "4px 8px",
            },
          })}
        />
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>Showing {filteredEvents.length} approved leave requests</span>
        {filters.userIds.length > 0 && (
          <span>• {filters.userIds.length} user(s) filtered</span>
        )}
        {filters.departments.length > 0 && (
          <span>• {filters.departments.length} department(s) filtered</span>
        )}
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
