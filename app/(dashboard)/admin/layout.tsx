"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Settings,
  Shield,
  FileText,
  Calendar,
  BarChart3,
  Plus,
  AlertCircle,
  Clock,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState("users");

  const adminStats = [
    {
      title: "Total Users",
      value: "124",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active Leaves",
      value: "18",
      change: "+3",
      icon: Calendar,
      color: "text-green-600",
    },
    {
      title: "Pending Approvals",
      value: "7",
      change: "-2",
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "System Alerts",
      value: "3",
      change: "0",
      icon: AlertCircle,
      color: "text-red-600",
    },
  ];

  const navigationItems = [
    {
      id: "users",
      label: "User Management",
      icon: Users,
      description: "Manage user accounts and roles",
    },
    {
      id: "leave-types",
      label: "Leave Types",
      icon: Calendar,
      description: "Configure leave policies and types",
    },
    {
      id: "settings",
      label: "System Settings",
      icon: Settings,
      description: "System configuration and policies",
    },
    {
      id: "audit",
      label: "Audit Logs",
      icon: FileText,
      description: "System activity and audit trails",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      description: "System analytics and reports",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
          <p className="text-muted-foreground">
            Manage system configuration and user accounts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Shield className="w-3 h-3 mr-1" />
            Admin Access
          </Badge>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Quick Action
          </Button>
        </div>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminStats.map((stat, index) => (
          <Card key={index} className="p-6 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <span
                    className={
                      stat.change.startsWith("+")
                        ? "text-green-600"
                        : stat.change.startsWith("-")
                          ? "text-red-600"
                          : "text-gray-600"
                    }
                  >
                    {stat.change} from last month
                  </span>
                </p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color} opacity-20`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Navigation Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          {navigationItems.map((item) => (
            <TabsTrigger
              key={item.id}
              value={item.id}
              className="flex items-center gap-2"
            >
              <item.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="min-h-[600px]">{children}</div>
      </Tabs>
    </div>
  );
}
