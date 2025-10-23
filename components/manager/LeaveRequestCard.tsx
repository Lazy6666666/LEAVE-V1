"use client";

/**
 * Leave Request Card Component
 * T-012: Manager approval interface
 */

import { useState, memo } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LeaveStatusBadge } from "@/components/employee/LeaveStatusBadge";
import {
  Calendar,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { RejectModal } from "./RejectModal";

interface LeaveRequest {
  id: string;
  user: {
    profile: {
      full_name: string;
      avatar_url?: string;
    };
  };
  leave_type: {
    name: string;
  };
  start_date: string;
  end_date: string;
  days_count: number;
  reason?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  manager_comment?: string;
  created_at: string;
}

interface LeaveRequestCardProps {
  request: LeaveRequest;
  onApprove?: (id: string) => Promise<void>;
  onReject?: (id: string, comment: string) => Promise<void>;
  onRefresh?: () => void;
}

const LeaveRequestCard = memo(function LeaveRequestCard({
  request,
  onApprove,
  onReject,
  onRefresh,
}: LeaveRequestCardProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const handleApprove = async () => {
    if (!onApprove) return;
    setIsApproving(true);
    try {
      await onApprove(request.id);
      onRefresh?.();
    } catch (error) {
      console.error("Error approving leave:", error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async (comment: string) => {
    if (!onReject) return;
    try {
      await onReject(request.id, comment);
      setIsRejectModalOpen(false);
      onRefresh?.();
    } catch (error) {
      console.error("Error rejecting leave:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isPending = request.status === "PENDING";

  return (
    <>
      <Card className="glass-card hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={request.user.profile.avatar_url} />
                <AvatarFallback>
                  {getInitials(request.user.profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">
                  {request.user.profile.full_name}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {request.leave_type.name}
                </p>
              </div>
            </div>
            <LeaveStatusBadge status={request.status} />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Date Range */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {format(new Date(request.start_date), "MMM dd, yyyy")} -{" "}
              {format(new Date(request.end_date), "MMM dd, yyyy")}
            </span>
            <Badge variant="outline" className="ml-auto">
              {request.days_count} {request.days_count === 1 ? "day" : "days"}
            </Badge>
          </div>

          {/* Reason */}
          {request.reason && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Reason</span>
              </div>
              <p className="text-sm bg-muted/50 rounded-lg p-3">
                {request.reason}
              </p>
            </div>
          )}

          {/* Manager Comment (if rejected) */}
          {request.manager_comment && request.status === "REJECTED" && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-destructive">
                <XCircle className="h-4 w-4" />
                <span>Rejection Reason</span>
              </div>
              <p className="text-sm bg-destructive/10 rounded-lg p-3 text-destructive">
                {request.manager_comment}
              </p>
            </div>
          )}

          {/* Requested Date */}
          <div className="text-xs text-muted-foreground">
            Requested on {format(new Date(request.created_at), "MMM dd, yyyy")}
          </div>
        </CardContent>

        {/* Action Buttons (only for pending requests) */}
        {isPending && (
          <CardFooter className="flex gap-2 pt-4 border-t">
            <Button
              onClick={handleApprove}
              disabled={isApproving}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isApproving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </>
              )}
            </Button>
            <Button
              onClick={() => setIsRejectModalOpen(true)}
              variant="destructive"
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Reject Modal */}
      <RejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onSubmit={handleReject}
        employeeName={request.user.profile.full_name}
      />
    </>
  );
});

export { LeaveRequestCard };
