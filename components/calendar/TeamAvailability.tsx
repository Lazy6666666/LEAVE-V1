"use client";

// Team Availability Component - Show detailed team availability

import { useMemo } from "react";
import { CalendarEvent } from "@/types/calendar";
import { Users, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { View } from "react-big-calendar";

interface TeamAvailabilityProps {
  events: CalendarEvent[];
  teamMembers: { id: string; name: string; department?: string }[];
  currentDate: Date;
  view: View;
}

export default function TeamAvailability({
  events,
  teamMembers,
  currentDate,
  view,
}: TeamAvailabilityProps) {
  const availabilityData = useMemo(() => {
    // Get date range based on current view
    getDateRange(currentDate, view);

    return teamMembers.map((member) => {
      const memberEvents = events.filter(
        (event) => event.resource.userId === member.id
      );
      const isAvailable = memberEvents.length === 0;

      return {
        ...member,
        isAvailable,
        events: memberEvents,
        leaveDays: memberEvents.reduce(
          (total, event) => total + event.resource.daysCount,
          0
        ),
      };
    });
  }, [events, teamMembers, currentDate, view]);

  const dateRangeText = useMemo(() => {
    const range = getDateRange(currentDate, view);
    return `${format(range.start, "MMM dd")} - ${format(range.end, "MMM dd, yyyy")}`;
  }, [currentDate, view]);

  const availableCount = availabilityData.filter(
    (member) => member.isAvailable
  ).length;
  const unavailableCount = availabilityData.length - availableCount;

  return (
    <Card className="glass-card border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Team Availability Details
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {dateRangeText}
          </span>
          <Badge variant="outline" className="text-xs">
            {view} view
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {/* Availability Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
              <CheckCircle className="h-4 w-4" />
              <span className="font-semibold">{availableCount}</span>
            </div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>

          <div className="text-center p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
              <XCircle className="h-4 w-4" />
              <span className="font-semibold">{unavailableCount}</span>
            </div>
            <div className="text-xs text-muted-foreground">On Leave</div>
          </div>

          <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <Clock className="h-4 w-4" />
              <span className="font-semibold">{events.length}</span>
            </div>
            <div className="text-xs text-muted-foreground">Total Leaves</div>
          </div>

          <div className="text-center p-3 rounded-lg bg-purple-50 border border-purple-200">
            <div className="text items-center justify-center gap-1 text-purple-600 mb-1">
              <Users className="h-4 w-4" />
              <span className="font-semibold">{teamMembers.length}</span>
            </div>
            <div className="text-xs text-muted-foreground">Team Size</div>
          </div>
        </div>

        {/* Team Members List */}
        <ScrollArea className="h-[400px] rounded-md border">
          <div className="space-y-2 p-4">
            {availabilityData.map((member) => (
              <div
                key={member.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                  member.isAvailable
                    ? "bg-green-50 border-green-200 hover:bg-green-100"
                    : "bg-red-50 border-red-200 hover:bg-red-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.id} />
                    <AvatarFallback className="text-xs">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="font-medium text-sm">{member.name}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {member.department && (
                        <Badge variant="outline" className="text-xs">
                          {member.department}
                        </Badge>
                      )}
                      {member.isAvailable ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          Available
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600">
                          <XCircle className="h-3 w-3" />
                          On Leave ({member.leaveDays} days)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {!member.isAvailable && member.events.length > 0 && (
                    <div className="space-y-1">
                      {member.events.slice(0, 2).map((event, idx) => (
                        <div key={idx} className="text-xs">
                          <div className="flex items-center gap-1 justify-end">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: event.resource.leaveTypeColor,
                              }}
                            />
                            <span className="font-medium">
                              {event.resource.leaveType}
                            </span>
                          </div>
                          <div className="text-muted-foreground">
                            {format(new Date(event.start), "MMM dd")} -{" "}
                            {format(new Date(event.end), "MMM dd")}
                          </div>
                        </div>
                      ))}
                      {member.events.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{member.events.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Department Summary */}
        {availabilityData.some((member) => member.department) && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium text-sm mb-3">Department Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(
                availabilityData.reduce(
                  (acc, member) => {
                    if (member.department) {
                      if (!acc[member.department]) {
                        acc[member.department] = { total: 0, available: 0 };
                      }
                      acc[member.department].total++;
                      if (member.isAvailable)
                        acc[member.department].available++;
                    }
                    return acc;
                  },
                  {} as Record<string, { total: number; available: number }>
                )
              ).map(([department, stats]) => (
                <div
                  key={department}
                  className="flex items-center justify-between p-2 rounded border"
                >
                  <span className="text-sm font-medium">{department}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {stats.available}/{stats.total}
                    </span>
                    <div className="w-12 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-green-600 rounded-full"
                        style={{
                          width: `${Math.round((stats.available / stats.total) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to get date range based on calendar view
function getDateRange(date: Date, view: View): { start: Date; end: Date } {
  const year = date.getFullYear();
  const month = date.getMonth();

  switch (view) {
    case "month":
      return {
        start: new Date(year, month, 1),
        end: new Date(year, month + 1, 0),
      };
    case "week":
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return { start: startOfWeek, end: endOfWeek };
    case "day":
      return {
        start: new Date(year, month, date.getDate()),
        end: new Date(year, month, date.getDate()),
      };
    default:
      return {
        start: new Date(year, month, 1),
        end: new Date(year, month + 1, 0),
      };
  }
}
