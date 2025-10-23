"use client";

// Conflict Warning Component - Display leave conflict warnings

import { ConflictDetection } from "@/types/calendar";
import { AlertTriangle, X, Calendar, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ConflictWarningProps {
  conflictDetection: ConflictDetection;
  selectedSlot: { start: Date; end: Date } | null;
  onClear: () => void;
}

export default function ConflictWarning({
  conflictDetection,
  selectedSlot,
  onClear,
}: ConflictWarningProps) {
  const { severity, conflicts, message, canOverride } = conflictDetection;

  const getAlertVariant = () => {
    switch (severity) {
      case "blocking":
        return "destructive";
      case "warning":
        return "default";
      default:
        return "default";
    }
  };

  const getIconColor = () => {
    switch (severity) {
      case "blocking":
        return "text-destructive";
      case "warning":
        return "text-yellow-600";
      default:
        return "text-blue-600";
    }
  };

  return (
    <Alert
      variant={getAlertVariant()}
      className="relative border-2 animate-in slide-in-from-top duration-300"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className={`h-5 w-5 mt-0.5 ${getIconColor()}`} />

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">
              {severity === "blocking"
                ? "Blocking Conflict"
                : "Conflict Warning"}
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-6 w-6 p-0 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <AlertDescription className="space-y-3">
            <p className="font-medium">{message}</p>

            {selectedSlot && (
              <div className="flex items-center gap-2 text-sm bg-muted/50 rounded p-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Selected: {format(selectedSlot.start, "MMM dd, yyyy")} -{" "}
                  {format(selectedSlot.end, "MMM dd, yyyy")}
                </span>
              </div>
            )}

            {conflicts.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Users className="h-4 w-4" />
                  Conflicting Team Members:
                </div>
                <div className="space-y-2">
                  {conflicts.map((conflict, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm bg-muted/30 rounded p-2 border"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{conflict.userName}</span>
                        <Badge variant="outline" className="text-xs">
                          {conflict.leaveType}
                        </Badge>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <div>
                          {format(new Date(conflict.startDate), "MMM dd")} -{" "}
                          {format(new Date(conflict.endDate), "MMM dd")}
                        </div>
                        <div className="font-medium text-foreground">
                          {conflict.overlapDays} day
                          {conflict.overlapDays > 1 ? "s" : ""} overlap
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2 border-t">
              <Badge
                variant={severity === "blocking" ? "destructive" : "secondary"}
                className="text-xs"
              >
                {conflicts.length} conflict{conflicts.length > 1 ? "s" : ""}
              </Badge>
              {canOverride && (
                <span className="text-xs text-muted-foreground">
                  You can proceed with this leave request
                </span>
              )}
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
