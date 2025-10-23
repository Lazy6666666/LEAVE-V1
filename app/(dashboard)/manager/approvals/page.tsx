"use client";

/**
 * Manager Approvals Page
 * T-012: Manager approval interface
 */

import { useState, useEffect } from "react";
import { LeaveRequestCard } from "@/components/manager/LeaveRequestCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SkeletonList } from "@/components/ui/enhanced-skeleton";
import { RefreshCw, Filter } from "lucide-react";

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

export default function ManagerApprovalsPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>("all");

  const fetchLeaves = async (status?: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (status && status !== "all") {
        params.append("status", status.toUpperCase());
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
    const status = activeTab === "all" ? undefined : activeTab;
    fetchLeaves(status);
  }, [activeTab]);

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/leaves/${id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error("Failed to approve leave");
      }
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const handleReject = async (id: string, comment: string) => {
    try {
      const response = await fetch(`/api/leaves/${id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ manager_comment: comment }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject leave");
      }
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const filteredLeaves =
    selectedLeaveType === "all"
      ? leaves
      : leaves.filter((leave) => leave.leave_type.name === selectedLeaveType);

  const pendingCount = leaves.filter((l) => l.status === "PENDING").length;
  const approvedCount = leaves.filter((l) => l.status === "APPROVED").length;
  const rejectedCount = leaves.filter((l) => l.status === "REJECTED").length;

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Leave Approvals</h1>
        <p className="text-muted-foreground">
          Review and manage leave requests from your team
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardDescription>Pending Requests</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {pendingCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {approvedCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardDescription>Rejected</CardDescription>
            <CardTitle className="text-3xl text-red-600">
              {rejectedCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Select value={selectedLeaveType} onValueChange={setSelectedLeaveType}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Annual Leave">Annual Leave</SelectItem>
            <SelectItem value="Sick Leave">Sick Leave</SelectItem>
            <SelectItem value="Personal Leave">Personal Leave</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() =>
            fetchLeaves(activeTab === "all" ? undefined : activeTab)
          }
          className="ml-auto"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <SkeletonList items={5} />
          ) : filteredLeaves.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-2">
                  No leave requests found
                </p>
                <p className="text-sm text-muted-foreground">
                  {activeTab === "pending"
                    ? "There are no pending requests at the moment"
                    : `No ${activeTab} requests to display`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredLeaves.map((request) => (
                <LeaveRequestCard
                  key={request.id}
                  request={request}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onRefresh={() =>
                    fetchLeaves(activeTab === "all" ? undefined : activeTab)
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
