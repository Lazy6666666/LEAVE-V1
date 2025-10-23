"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase,
  Heart,
  UserCheck,
  Stethoscope,
  GraduationCap,
  Home,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface LeaveBalance {
  type: string;
  used: number;
  total: number;
  color: string;
  icon: any;
  trend?: number;
  departmentAvg?: number;
}

interface LeaveBalanceUtilizationProps {
  className?: string;
}

export default function LeaveBalanceUtilization({
  className,
}: LeaveBalanceUtilizationProps) {
  const [selectedView, setSelectedView] = useState("personal");

  const personalLeaveBalances: LeaveBalance[] = [
    {
      type: "Annual Leave",
      used: 12,
      total: 20,
      color: "bg-blue-500",
      icon: Briefcase,
      trend: 5.2,
      departmentAvg: 15,
    },
    {
      type: "Sick Leave",
      used: 3,
      total: 10,
      color: "bg-green-500",
      icon: Heart,
      trend: -2.1,
      departmentAvg: 4,
    },
    {
      type: "Personal Leave",
      used: 2,
      total: 5,
      color: "bg-purple-500",
      icon: UserCheck,
      trend: 0,
      departmentAvg: 2.5,
    },
    {
      type: "Maternity/Paternity",
      used: 0,
      total: 30,
      color: "bg-pink-500",
      icon: Stethoscope,
      trend: 0,
      departmentAvg: 5,
    },
    {
      type: "Study Leave",
      used: 1,
      total: 3,
      color: "bg-indigo-500",
      icon: GraduationCap,
      trend: 10,
      departmentAvg: 1,
    },
    {
      type: "Compassionate Leave",
      used: 0,
      total: 5,
      color: "bg-orange-500",
      icon: Home,
      trend: 0,
      departmentAvg: 0.5,
    },
  ];

  const teamLeaveBalances: LeaveBalance[] = [
    {
      type: "Annual Leave",
      used: 145,
      total: 300,
      color: "bg-blue-500",
      icon: Briefcase,
      trend: 8.3,
      departmentAvg: 140,
    },
    {
      type: "Sick Leave",
      used: 68,
      total: 150,
      color: "bg-green-500",
      icon: Heart,
      trend: -5.2,
      departmentAvg: 72,
    },
    {
      type: "Personal Leave",
      used: 42,
      total: 75,
      color: "bg-purple-500",
      icon: UserCheck,
      trend: 2.1,
      departmentAvg: 38,
    },
    {
      type: "Maternity/Paternity",
      used: 25,
      total: 90,
      color: "bg-pink-500",
      icon: Stethoscope,
      trend: 15.4,
      departmentAvg: 20,
    },
    {
      type: "Study Leave",
      used: 8,
      total: 45,
      color: "bg-indigo-500",
      icon: GraduationCap,
      trend: -3.2,
      departmentAvg: 10,
    },
    {
      type: "Compassionate Leave",
      used: 3,
      total: 30,
      color: "bg-orange-500",
      icon: Home,
      trend: 0,
      departmentAvg: 2,
    },
  ];

  const getBalanceStatus = (used: number, total: number) => {
    const percentage = (used / total) * 100;
    if (percentage >= 90)
      return {
        status: "Critical",
        color: "text-red-600",
        bgColor: "bg-red-100",
      };
    if (percentage >= 75)
      return {
        status: "Warning",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      };
    if (percentage >= 50)
      return {
        status: "Moderate",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      };
    return {
      status: "Healthy",
      color: "text-green-600",
      bgColor: "bg-green-100",
    };
  };

  const getProgressBarColor = (used: number, total: number) => {
    const percentage = (used / total) * 100;
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    if (percentage >= 50) return "bg-blue-500";
    return "bg-green-500";
  };

  const balances =
    selectedView === "personal" ? personalLeaveBalances : teamLeaveBalances;
  const totalUsed = balances.reduce((sum, balance) => sum + balance.used, 0);
  const totalAllocated = balances.reduce(
    (sum, balance) => sum + balance.total,
    0
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">Leave Balance Utilization</h3>
          <p className="text-muted-foreground">
            Track your leave balance usage and compare with team averages
          </p>
        </div>
        <Tabs value={selectedView} onValueChange={setSelectedView}>
          <TabsList>
            <TabsTrigger value="personal">My Balance</TabsTrigger>
            <TabsTrigger value="team">Team Balance</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Overall Utilization</span>
            <Badge variant="outline" className="text-sm">
              {selectedView === "personal" ? "Personal" : "Team"} View
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Used</p>
              <p className="text-2xl font-bold">{totalUsed} days</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Allocated</p>
              <p className="text-2xl font-bold">{totalAllocated} days</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Utilization Rate</p>
              <p className="text-2xl font-bold">
                {((totalUsed / totalAllocated) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Progress
              value={(totalUsed / totalAllocated) * 100}
              className="h-3"
            />
          </div>
        </CardContent>
      </Card>

      {/* Leave Balance Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {balances.map((balance) => {
          const percentage = (balance.used / balance.total) * 100;
          const status = getBalanceStatus(balance.used, balance.total);
          const progressColor = getProgressBarColor(
            balance.used,
            balance.total
          );

          return (
            <Card key={balance.type} className="relative overflow-hidden">
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
                  <Badge
                    variant="outline"
                    className={`${status.bgColor} ${status.color} border-current`}
                  >
                    {status.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Used</span>
                    <span className="font-medium">
                      {balance.used}/{balance.total}
                    </span>
                  </div>
                  <Progress
                    value={percentage}
                    className={`h-2 ${progressColor}`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{balance.total - balance.used} days remaining</span>
                    <span>{percentage.toFixed(0)}% used</span>
                  </div>

                  {balance.trend !== undefined && (
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-muted-foreground">
                        vs. Dept Avg
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">
                          {balance.departmentAvg || 0} days
                        </span>
                        {balance.trend !== 0 && (
                          <div
                            className={`flex items-center gap-1 ${
                              balance.trend > 0
                                ? "text-red-500"
                                : "text-green-500"
                            }`}
                          >
                            {balance.trend > 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            <span className="text-xs">
                              {Math.abs(balance.trend).toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {percentage >= 75 && (
                    <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded-md border border-yellow-200">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-yellow-700">
                        {percentage >= 90
                          ? "Critical: You've used most of your leave balance. Plan accordingly."
                          : "Warning: You're approaching your leave limit."}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your leave balance efficiently
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-medium">Request Leave</p>
                <p className="text-xs text-muted-foreground">
                  Submit new request
                </p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-medium">View History</p>
                <p className="text-xs text-muted-foreground">
                  Past leave records
                </p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-medium">Balance Report</p>
                <p className="text-xs text-muted-foreground">
                  Download statement
                </p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-medium">Leave Policy</p>
                <p className="text-xs text-muted-foreground">
                  Company guidelines
                </p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
