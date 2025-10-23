"use client";

// Calendar Event Component - Display leave event in calendar

import { CalendarEvent } from "@/types/calendar";
import { User, Calendar } from "lucide-react";

interface CalendarEventComponentProps {
  event: CalendarEvent;
}

export default function CalendarEventComponent({
  event,
}: CalendarEventComponentProps) {
  return (
    <div className="group flex flex-col gap-1 p-2 h-full rounded-md text-white">
      <div className="flex items-center gap-1.5 truncate">
        <User className="h-3 w-3 flex-shrink-0 opacity-80" />
        <span className="font-medium text-xs truncate">
          {event.resource.userName}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs opacity-90 truncate font-medium">
          {event.resource.leaveType}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Calendar className="h-3 w-3 opacity-70" />
          <span className="text-xs opacity-80 font-medium">
            {event.resource.daysCount}d
          </span>
        </div>
      </div>

      {/* Hover tooltip indicator */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="text-xs truncate border-t border-white/20 pt-1">
          {new Date(event.start).toLocaleDateString()} -{" "}
          {new Date(event.end).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
