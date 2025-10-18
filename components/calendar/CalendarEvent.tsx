"use client";

// Calendar Event Component - Display leave event in calendar

import { CalendarEvent } from "@/types/calendar";

interface CalendarEventComponentProps {
  event: CalendarEvent;
}

export default function CalendarEventComponent({
  event,
}: CalendarEventComponentProps) {
  return (
    <div className="flex items-center gap-1 text-white truncate">
      <span className="font-medium text-xs">{event.resource.userName}</span>
      <span className="text-xs opacity-80">({event.resource.daysCount}d)</span>
    </div>
  );
}
