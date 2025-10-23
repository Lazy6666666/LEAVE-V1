"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import AnalyticsCharts from "@/components/analytics/analytics-charts";
// import LeaveBalanceUtilization from "@/components/analytics/leave-balance-utilization";
import {
  Calendar,
  Clock,
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  Briefcase,
  Heart,
  Stethoscope,
  UserCheck,
} from "lucide-react";

export default function DashboardPage() {
  // Mock data - In a real app, this would come from your API
  const stats = {
    totalLeaveDays: 24,
    usedLeaveDays: 8,
    pendingRequests: 2,
    approvedRequests: 12,
    teamSize: 15,
    teamOnLeave: 3,
    upcomingLeave: new Date("2024-02-15"),
    notifications: 5,
  };

  const leaveBalances = [
    {
      type: "Annual Leave",
      used: 8,
      total: 20,
      color: "bg-blue-500",
      icon: Briefcase,
    },
    {
      type: "Sick Leave",
      used: 2,
      total: 10,
      color: "bg-green-500",
      icon: Heart,
    },
    {
      type: "Personal Leave",
      used: 1,
      total: 5,
      color: "bg-purple-500",
      icon: UserCheck,
    },
    {
      type: "Maternity/Paternity",
      used: 0,
      total: 30,
      color: "bg-pink-500",
      icon: Stethoscope,
    },
  ];

  const recentRequests = [
    {
      id: 1,
      type: "Annual Leave",
      startDate: "2024-02-15",
      endDate: "2024-02-17",
      status: "pending",
      days: 3,
      reason: "Family vacation",
    },
    {
      id: 2,
      type: "Sick Leave",
      startDate: "2024-01-28",
      endDate: "2024-01-29",
      status: "approved",
      days: 2,
      reason: "Medical appointment",
    },
    {
      id: 3,
      type: "Personal Leave",
      startDate: "2024-01-15",
      endDate: "2024-01-15",
      status: "rejected",
      days: 1,
      reason: "Personal matters",
    },
  ];

  const teamLeaveCalendar = [
    {
      name: "Sarah Johnson",
      type: "Annual Leave",
      dates: "Feb 10-12",
      avatar: "SJ",
    },
    {
      name: "Mike Chen",
      type: "Sick Leave",
      dates: "Feb 8-9",
      avatar: "MC",
    },
    {
      name: "Emily Davis",
      type: "Personal Leave",
      dates: "Feb 15",
      avatar: "ED",
    },
  ];

  const quickActions = [
    {
      title: "Request Leave",
      description: "Submit a new leave request",
      icon: Plus,
      href: "/dashboard/employee/leaves/new",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "View Calendar",
      description: "See team leave schedule",
      icon: Calendar,
      href: "/dashboard/calendar",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Leave History",
      description: "Review past leave requests",
      icon: Clock,
      href: "/dashboard/employee/leaves",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "Documents",
      description: "Access company documents",
      icon: FileText,
      href: "/dashboard/documents",
      color: "bg-orange-500 hover:bg-orange-600",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
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
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground welcome-message" data-testid="welcome-message">
            Welcome back! Here&apos;s your leave management overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/dashboard/employee/leaves/new">
              <Plus className="w-4 h-4 mr-2" />
              New Leave Request
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Leave Days
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeaveDays}</div>
            <p className="text-xs text-muted-foreground">
              {stats.usedLeaveDays} used this year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Requests
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamSize}</div>
            <p className="text-xs text-muted-foreground">
              {stats.teamOnLeave} currently on leave
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notifications}</div>
            <p className="text-xs text-muted-foreground">New updates</p>
          </CardContent>
        </Card>
      </div>

      {/* Leave Balance Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Leave Balance Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {leaveBalances.map((balance) => (
            <Card key={balance.type}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${balance.color} bg-opacity-10`}
                    >
                      <balance.icon
                        className={`w-4 h-4 ${balance.color.replace("bg-", "text-")}`}
                      />
                    </div>
                    <CardTitle className="text-sm font-medium">
                      {balance.type}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Used</span>
                    <span className="font-medium">
                      {balance.used}/{balance.total}
                    </span>
                  </div>
                  <Progress
                    value={(balance.used / balance.total) * 100}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    {balance.total - balance.used} days remaining
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Requests */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Leave Requests</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/employee/leaves">
                  <Eye className="w-4 h-4 mr-2" />
                  View All
                </Link>
              </Button>
            </div>
            <CardDescription>
              Your latest leave requests and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium">{request.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.startDate} to {request.endDate} ({request.days}{" "}
                        days)
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {request.reason}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`flex items-center gap-1 ${getStatusColor(request.status)}`}
                  >
                    {getStatusIcon(request.status)}
                    {request.status.charAt(0).toUpperCase() +
                      request.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                variant="outline"
                className="w-full justify-start h-auto p-4"
                asChild
              >
                <Link href={action.href}>
                  <div
                    className={`p-2 rounded-lg ${action.color} text-white mr-3`}
                  >
                    <action.icon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{action.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Team Leave Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Leave Calendar</CardTitle>
              <CardDescription>
                See who&apos;s on leave in your team
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/calendar">
                <Calendar className="w-4 h-4 mr-2" />
                Full Calendar
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teamLeaveCalendar.map((person, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-medium">
                    {person.avatar}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{person.name}</p>
                  <p className="text-sm text-muted-foreground">{person.type}</p>
                </div>
                <Badge variant="secondary">{person.dates}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interactive Analytics Section */}
      <div className="space-y-8">
        <Tabs defaultValue="charts" className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-2">
              <TabsTrigger value="charts">Analytics Charts</TabsTrigger>
              <TabsTrigger value="balance">Balance Utilization</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="charts" className="space-y-0 mt-6">
            {/* <AnalyticsCharts /> */}
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>Analytics charts will be displayed here</p>
            </div>
          </TabsContent>

          <TabsContent value="balance" className="space-y-0 mt-6">
            {/* <LeaveBalanceUtilization /> */}
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>Leave balance utilization will be displayed here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
