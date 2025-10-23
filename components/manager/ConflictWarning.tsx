"use client";

/**
 * ConflictWarning Component
 * Displays warning when multiple team members request the same dates
 */

import React from "react";
import { AlertTriangle, Calendar } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ConflictWarningProps {
  conflicts: Array<{
    date: string;
    employees: Array<{
      id: string;
      name: string;
      avatar?: string;
      department: string;
    }>;
    maxAllowed?: number;
  }>;
  className?: string;
}

export function ConflictWarning({
  conflicts,
  className,
}: ConflictWarningProps) {
  if (!conflicts || conflicts.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getSeverityColor = (count: number, maxAllowed: number = 2) => {
    if (count >= maxAllowed + 2) return "destructive";
    if (count >= maxAllowed + 1) return "default";
    return "secondary";
  };

  return (
    <div className={cn("space-y-3", className)}>
      {conflicts.map((conflict, index) => {
        const severity = getSeverityColor(
          conflict.employees.length,
          conflict.maxAllowed
        );

        return (
          <Alert
            key={index}
            variant={severity as "default" | "destructive" | null}
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Scheduling Conflict on {formatDate(conflict.date)}
            </AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    {conflict.employees.length} employee
                    {conflict.employees.length > 1 ? "s" : ""} on leave
                  </span>
                  {conflict.maxAllowed && (
                    <Badge variant="outline" className="text-xs">
                      Max allowed: {conflict.maxAllowed}
                    </Badge>
                  )}
                </div>

                <div className="flex -space-x-2">
                  {conflict.employees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex flex-col items-center"
                    >
                      <Avatar className="h-8 w-8 border-2 border-background">
                        <AvatarImage
                          src={employee.avatar}
                          alt={employee.name}
                        />
                        <AvatarFallback className="text-xs">
                          {employee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground mt-1 leading-none">
                        {employee.name.split(" ")[0]}
                      </span>
                    </div>
                  ))}
                </div>

                {conflict.employees.length > (conflict.maxAllowed || 2) && (
                  <div className="mt-2 p-2 bg-destructive/10 rounded border border-destructive/20">
                    <p className="text-xs text-destructive font-medium">
                      ⚠️ Coverage risk: Too many team members will be on leave
                    </p>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}
