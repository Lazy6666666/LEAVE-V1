"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// Optimized lucide-react imports for tree-shaking
import {
  Settings,
  FileText,
  Calendar,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Download,
  Eye,
} from "@/lib/utils/icons";

export default function AdminDashboard() {
  const recentActivity = [
    {
      id: 1,
      user: "John Doe",
      action: "Created leave request",
      target: "Annual Leave - Dec 15-20",
      time: "2 minutes ago",
      status: "success",
    },
    {
      id: 2,
      user: "Jane Smith",
      action: "Approved leave request",
      target: "Sick Leave - Dec 10",
      time: "15 minutes ago",
      status: "success",
    },
    {
      id: 3,
      user: "System",
      action: "Document expiry warning",
      target: "Insurance Policy - 5 days remaining",
      time: "1 hour ago",
      status: "warning",
    },
    {
      id: 4,
      user: "Mike Johnson",
      action: "Failed login attempt",
      target: "Multiple attempts detected",
      time: "2 hours ago",
      status: "error",
    },
  ];

  const systemMetrics = [
    {
      title: "User Registrations",
      current: 124,
      previous: 112,
      trend: "up",
      percentage: "+10.7%",
    },
    {
      title: "Leave Requests",
      current: 89,
      previous: 94,
      trend: "down",
      percentage: "-5.3%",
    },
    {
      title: "Document Uploads",
      current: 45,
      previous: 38,
      trend: "up",
      percentage: "+18.4%",
    },
    {
      title: "System Uptime",
      current: "99.9%",
      previous: "99.8%",
      trend: "up",
      percentage: "+0.1%",
    },
  ];

  const quickActions = [
    {
      title: "Add New User",
      description: "Create a new user account",
      icon: UserPlus,
      href: "/admin/users?action=create",
      color: "bg-blue-500",
    },
    {
      title: "Configure Leave Types",
      description: "Manage leave policies",
      icon: Calendar,
      href: "/admin/leave-types",
      color: "bg-green-500",
    },
    {
      title: "System Settings",
      description: "Update system configuration",
      icon: Settings,
      href: "/admin/settings",
      color: "bg-purple-500",
    },
    {
      title: "View Audit Logs",
      description: "Check system activity",
      icon: FileText,
      href: "/admin/audit",
      color: "bg-orange-500",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening in your system
            today.
          </p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <Card
            key={index}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-lg ${action.color} bg-opacity-10`}>
                <action.icon
                  className={`w-6 h-6 ${action.color.replace("bg-", "text-")}`}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{action.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemMetrics.map((metric, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold">{metric.current}</p>
                <div className="flex items-center space-x-1 mt-1">
                  {metric.trend === "up" ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span
                    className={`text-xs ${
                      metric.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {metric.percentage} from last period
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            View All
          </Button>
        </div>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(activity.status)}
                <div>
                  <p className="text-sm font-medium">
                    <span className="font-semibold">{activity.user}</span>{" "}
                    {activity.action}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.target}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-muted-foreground">
                  {activity.time}
                </span>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">System Health</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database Status</span>
              <Badge className="bg-green-100 text-green-800">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">API Response Time</span>
              <Badge className="bg-green-100 text-green-800">124ms</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Storage Usage</span>
              <Badge className="bg-yellow-100 text-yellow-800">68%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Last Backup</span>
              <Badge className="bg-green-100 text-green-800">2 hours ago</Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Pending Approvals</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div>
                <p className="text-sm font-medium">Sarah Wilson</p>
                <p className="text-xs text-muted-foreground">
                  Annual Leave - Dec 22-28
                </p>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Eye className="w-3 h-3" />
                </Button>
                <Button size="sm">
                  <CheckCircle className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div>
                <p className="text-sm font-medium">Tom Brown</p>
                <p className="text-xs text-muted-foreground">
                  Sick Leave - Dec 11
                </p>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Eye className="w-3 h-3" />
                </Button>
                <Button size="sm">
                  <CheckCircle className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
