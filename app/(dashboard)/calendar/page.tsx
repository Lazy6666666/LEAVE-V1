"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar as CalendarIcon,
  Users,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

// Mock data for demonstration
const mockLeaveData = [
  {
    id: 1,
    employee: "Sarah Johnson",
    department: "Engineering",
    type: "Annual Leave",
    startDate: "2024-02-10",
    endDate: "2024-02-12",
    status: "approved",
    days: 3,
    avatar: "SJ",
  },
  {
    id: 2,
    employee: "Mike Chen",
    department: "Marketing",
    type: "Sick Leave",
    startDate: "2024-02-08",
    endDate: "2024-02-09",
    status: "approved",
    days: 2,
    avatar: "MC",
  },
  {
    id: 3,
    employee: "Emily Davis",
    department: "Sales",
    type: "Personal Leave",
    startDate: "2024-02-15",
    endDate: "2024-02-15",
    status: "pending",
    days: 1,
    avatar: "ED",
  },
  {
    id: 4,
    employee: "James Wilson",
    department: "HR",
    type: "Annual Leave",
    startDate: "2024-02-20",
    endDate: "2024-02-25",
    status: "approved",
    days: 5,
    avatar: "JW",
  },
  {
    id: 5,
    employee: "Lisa Anderson",
    department: "Finance",
    type: "Maternity Leave",
    startDate: "2024-02-01",
    endDate: "2024-04-30",
    status: "approved",
    days: 90,
    avatar: "LA",
  },
];

const departments = [
  "All Departments",
  "Engineering",
  "Marketing",
  "Sales",
  "HR",
  "Finance",
  "Operations",
];
const leaveTypes = [
  "All Types",
  "Annual Leave",
  "Sick Leave",
  "Personal Leave",
  "Maternity/Paternity",
  "Study Leave",
];
const statuses = ["All Status", "Approved", "Pending", "Rejected"];

export default function CalendarPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] =
    useState("All Departments");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [currentMonth] = useState("February 2024");

  // Filter leaves based on criteria
  const filteredLeaves = mockLeaveData.filter((leave) => {
    const matchesSearch =
      leave.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "All Departments" ||
      leave.department === selectedDepartment;
    const matchesType =
      selectedType === "All Types" || leave.type === selectedType;
    const matchesStatus =
      selectedStatus === "All Status" ||
      leave.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesDepartment && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Annual Leave":
        return "text-blue-600 bg-blue-50";
      case "Sick Leave":
        return "text-green-600 bg-green-50";
      case "Personal Leave":
        return "text-purple-600 bg-purple-50";
      case "Maternity/Paternity":
        return "text-pink-600 bg-pink-50";
      case "Study Leave":
        return "text-orange-600 bg-orange-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Team Calendar</h1>
          <p className="text-muted-foreground mt-1">
            View and manage team leave schedules
          </p>
        </div>
        <Button className="btn-hover-primary">
          <CalendarIcon className="w-4 h-4 mr-2" />
          Export Calendar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On Leave Today</p>
                <p className="text-2xl font-bold text-foreground">5</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold text-foreground">12</p>
              </div>
              <CalendarIcon className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">3</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conflicts</p>
                <p className="text-2xl font-bold text-foreground">1</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedDepartment}
              onValueChange={setSelectedDepartment}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Calendar */}
        <Card className="lg:col-span-2 glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{currentMonth}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Today
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Simple Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="p-2 text-sm font-semibold text-muted-foreground border-b"
                >
                  {day}
                </div>
              ))}
              {/* Calendar Days */}
              {Array.from({ length: 35 }, (_, i) => {
                const dayNum = i - 3 + 1;
                const isCurrentMonth = dayNum > 0 && dayNum <= 29;
                const hasLeave = dayNum === 8 || dayNum === 10 || dayNum === 15;

                return (
                  <div
                    key={i}
                    className={`
                      p-2 min-h-[80px] border rounded-lg
                      ${isCurrentMonth ? "bg-card" : "bg-muted/50"}
                      ${hasLeave ? "border-primary" : "border-border"}
                      ${dayNum === 15 ? "bg-yellow-50 border-yellow-200" : ""}
                    `}
                  >
                    {isCurrentMonth && (
                      <>
                        <div className="text-sm font-medium">{dayNum}</div>
                        {hasLeave && (
                          <div className="mt-1 space-y-1">
                            {dayNum === 8 && (
                              <div className="text-xs bg-green-100 text-green-800 rounded px-1 py-0.5">
                                MC
                              </div>
                            )}
                            {dayNum === 10 && (
                              <div className="text-xs bg-blue-100 text-blue-800 rounded px-1 py-0.5">
                                SJ
                              </div>
                            )}
                            {dayNum === 15 && (
                              <div className="text-xs bg-yellow-100 text-yellow-800 rounded px-1 py-0.5">
                                ED
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Leave List */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Upcoming Leaves
              <Badge variant="secondary">{filteredLeaves.length}</Badge>
            </CardTitle>
            <CardDescription>Team members on leave</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredLeaves.map((leave) => (
              <div
                key={leave.id}
                className="border rounded-lg p-3 space-y-2 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {leave.avatar}
                    </div>
                    <div>
                      <p className="font-medium">{leave.employee}</p>
                      <p className="text-sm text-muted-foreground">
                        {leave.department}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(leave.status)}>
                    {getStatusIcon(leave.status)}
                    <span className="ml-1">{leave.status}</span>
                  </Badge>
                </div>
                <div className="space-y-1">
                  <Badge className={getTypeColor(leave.type)} variant="outline">
                    {leave.type}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {leave.startDate} to {leave.endDate} ({leave.days} days)
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Conflict Warning */}
      {filteredLeaves.some((l) => l.status === "pending") && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">
                  Pending Leave Requests
                </p>
                <p className="text-sm text-yellow-700">
                  You have{" "}
                  {filteredLeaves.filter((l) => l.status === "pending").length}{" "}
                  pending leave requests requiring attention.
                </p>
              </div>
              <Button size="sm" className="ml-auto">
                Review Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
