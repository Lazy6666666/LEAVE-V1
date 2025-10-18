"use client";

/**
 * Employee Leave Dashboard
 * T-014: Employee status tracking dashboard
 */

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeaveStatusBadge } from "@/components/employee/LeaveStatusBadge";
import { CancelLeaveDialog } from "@/components/employee/CancelLeaveDialog";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Calendar,
  FileText,
  User,
  XCircle,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";

interface Leave {
  id: string;
  leave_type: {
    name: string;
  };
  start_date: string;
  end_date: string;
  days_count: number;
  reason?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  manager_comment?: string;
  approved_at?: string;
  created_at: string;
}

export default function EmployeeLeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus && filterStatus !== "all") {
        params.append("status", filterStatus.toUpperCase());
      }

      const response = await fetch(`/api/leaves?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setLeaves(data.leaves || []);
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [filterStatus]);

  const handleCancelLeave = async (leaveId: string, reason?: string) => {
    try {
      const response = await fetch(`/api/leaves/${leaveId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cancellation_reason: reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to cancel leave");
      }

      await fetchLeaves();
    } catch (error) {
      console.error("Error cancelling leave:", error);
      throw error;
    }
  };

  const canCancelLeave = (leave: Leave) => {
    if (leave.status === "CANCELLED" || leave.status === "REJECTED") {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(leave.start_date);
    return startDate >= today;
  };

  const openCancelDialog = (leave: Leave) => {
    setSelectedLeave(leave);
    setCancelDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Leave Requests</h1>
          <p className="text-muted-foreground">
            View and manage your leave requests
          </p>
        </div>
        <Link href="/employee/leaves/new">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leaves List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : leaves.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No leave requests found</p>
            <p className="text-sm text-muted-foreground mb-4">
              {filterStatus === "all"
                ? "You haven't submitted any leave requests yet"
                : `No ${filterStatus} requests found`}
            </p>
            <Link href="/employee/leaves/new">
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Your First Request
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {leaves.map((leave) => (
            <Card
              key={leave.id}
              className="glass-card hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {leave.leave_type.name}
                      <Badge variant="outline">
                        {leave.days_count}{" "}
                        {leave.days_count === 1 ? "day" : "days"}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {format(
                        new Date(leave.start_date),
                        "MMM dd, yyyy"
                      )} - {format(new Date(leave.end_date), "MMM dd, yyyy")}
                    </CardDescription>
                  </div>
                  <LeaveStatusBadge status={leave.status} />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Reason */}
                {leave.reason && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>Reason</span>
                    </div>
                    <p className="text-sm bg-muted/50 rounded-lg p-3">
                      {leave.reason}
                    </p>
                  </div>
                )}

                {/* Manager Comment */}
                {leave.manager_comment && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Manager Comment</span>
                    </div>
                    <p
                      className={`text-sm rounded-lg p-3 ${
                        leave.status === "REJECTED"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted/50"
                      }`}
                    >
                      {leave.manager_comment}
                    </p>
                  </div>
                )}

                {/* Timestamps */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <span>
                    Requested on{" "}
                    {format(new Date(leave.created_at), "MMM dd, yyyy")}
                  </span>
                  {leave.approved_at && (
                    <span>
                      {leave.status === "APPROVED" ? "Approved" : "Rejected"} on{" "}
                      {format(new Date(leave.approved_at), "MMM dd, yyyy")}
                    </span>
                  )}
                </div>

                {/* Cancel Button */}
                {canCancelLeave(leave) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openCancelDialog(leave)}
                    className="w-full text-destructive hover:bg-destructive/10"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Request
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Cancel Dialog */}
      {selectedLeave && (
        <CancelLeaveDialog
          isOpen={cancelDialogOpen}
          onClose={() => {
            setCancelDialogOpen(false);
            setSelectedLeave(null);
          }}
          onConfirm={(reason) => handleCancelLeave(selectedLeave.id, reason)}
          leaveDetails={{
            leaveType: selectedLeave.leave_type.name,
            startDate: format(
              new Date(selectedLeave.start_date),
              "MMM dd, yyyy"
            ),
            endDate: format(new Date(selectedLeave.end_date), "MMM dd, yyyy"),
            status: selectedLeave.status,
          }}
        />
      )}
    </div>
  );
}
