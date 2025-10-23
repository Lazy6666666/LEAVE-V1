/**
 * Animated Dashboard Cards Component
 * Enhanced dashboard cards with animations and interactions
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AnimatedStatCard,
  InteractiveCard,
} from "@/components/ui/interactive-elements";
import {
  Calendar,
  Clock,
  Users,
  FileText,
  AlertCircle,
  Plus,
  UserCheck,
  Briefcase,
  Heart,
  Stethoscope,
  ArrowRight,
} from "lucide-react";

interface DashboardStatsProps {
  stats?: {
    totalLeaveDays: number;
    usedLeaveDays: number;
    pendingRequests: number;
    approvedRequests: number;
    teamSize: number;
    teamOnLeave: number;
    upcomingLeave?: Date;
    notifications: number;
  };
}

export function AnimatedDashboardStats({ stats }: DashboardStatsProps) {
  const defaultStats = {
    totalLeaveDays: 24,
    usedLeaveDays: 8,
    pendingRequests: 2,
    approvedRequests: 12,
    teamSize: 15,
    teamOnLeave: 3,
    notifications: 5,
    ...stats,
  };

  const statCards = [
    {
      id: "balance",
      label: "Available Days",
      value: defaultStats.totalLeaveDays - defaultStats.usedLeaveDays,
      change:
        ((defaultStats.totalLeaveDays - defaultStats.usedLeaveDays) /
          defaultStats.totalLeaveDays) *
        100,
      changeLabel: "remaining",
      icon: <Calendar className="w-6 h-6" />,
      color: "var(--color-primary)",
      href: "/employee/leaves",
    },
    {
      id: "pending",
      label: "Pending Requests",
      value: defaultStats.pendingRequests,
      change: defaultStats.pendingRequests > 0 ? -10 : 0,
      changeLabel: "needs action",
      icon: <Clock className="w-6 h-6" />,
      color: "var(--color-warning)",
      href: "/manager/approvals",
    },
    {
      id: "team",
      label: "Team Available",
      value: defaultStats.teamSize - defaultStats.teamOnLeave,
      change:
        ((defaultStats.teamSize - defaultStats.teamOnLeave) /
          defaultStats.teamSize) *
        100,
      changeLabel: "at work",
      icon: <Users className="w-6 h-6" />,
      color: "var(--color-success)",
      href: "/calendar",
    },
    {
      id: "notifications",
      label: "New Notifications",
      value: defaultStats.notifications,
      change: defaultStats.notifications > 0 ? 20 : 0,
      changeLabel: "new",
      icon: <AlertCircle className="w-6 h-6" />,
      color: "var(--color-info)",
      href: "/notifications",
    },
  ];

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        initial: { opacity: 0 },
        animate: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      {statCards.map((card, index) => (
        <motion.div
          key={card.id}
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: {
              opacity: 1,
              y: 0,
              transition: {
                delay: index * 0.1,
                duration: 0.5,
                ease: [0.34, 1.56, 0.64, 1],
              },
            },
          }}
        >
          <Link href={card.href}>
            <InteractiveCard hover press>
              <AnimatedStatCard
                value={card.value}
                label={card.label}
                change={card.change}
                changeLabel={card.changeLabel}
                icon={card.icon}
                duration={1500}
              />
            </InteractiveCard>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}

interface LeaveBalanceCardProps {
  balances?: Array<{
    type: string;
    used: number;
    total: number;
    color: string;
    icon: React.ReactNode;
  }>;
}

export function AnimatedLeaveBalance({ balances }: LeaveBalanceCardProps) {
  const defaultBalances = [
    {
      type: "Annual Leave",
      used: 8,
      total: 20,
      color: "bg-blue-500",
      icon: <Briefcase className="w-5 h-5" />,
    },
    {
      type: "Sick Leave",
      used: 2,
      total: 10,
      color: "bg-green-500",
      icon: <Heart className="w-5 h-5" />,
    },
    {
      type: "Personal Leave",
      used: 1,
      total: 5,
      color: "bg-purple-500",
      icon: <UserCheck className="w-5 h-5" />,
    },
    {
      type: "Maternity/Paternity",
      used: 0,
      total: 30,
      color: "bg-pink-500",
      icon: <Stethoscope className="w-5 h-5" />,
    },
  ];

  const leaveBalances = balances || defaultBalances;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="glass-advanced">
        <CardHeader>
          <CardTitle className="text-lg text-gradient-enhanced">
            Leave Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {leaveBalances.map((balance, index) => {
            const percentage = (balance.used / balance.total) * 100;
            const remaining = balance.total - balance.used;

            return (
              <motion.div
                key={balance.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-2 rounded-lg", balance.color)}>
                      {balance.icon}
                    </div>
                    <span className="font-medium text-sm">{balance.type}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {remaining}/{balance.total} days
                  </span>
                </div>
                <div className="relative">
                  <Progress value={percentage} className="h-2" />
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/50 to-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{
                      duration: 1,
                      delay: 0.6 + index * 0.1,
                      ease: "easeOut",
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{balance.used} used</span>
                  <span>{percentage.toFixed(0)}%</span>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface RecentActivityProps {
  requests?: Array<{
    id: number;
    type: string;
    startDate: string;
    endDate: string;
    status: "pending" | "approved" | "rejected";
    days: number;
    reason: string;
  }>;
}

export function AnimatedRecentActivity({ requests }: RecentActivityProps) {
  const defaultRequests = [
    {
      id: 1,
      type: "Annual Leave",
      startDate: "2024-02-15",
      endDate: "2024-02-17",
      status: "pending" as const,
      days: 3,
      reason: "Family vacation",
    },
    {
      id: 2,
      type: "Sick Leave",
      startDate: "2024-01-28",
      endDate: "2024-01-29",
      status: "approved" as const,
      days: 1,
      reason: "Medical appointment",
    },
    {
      id: 3,
      type: "Personal Leave",
      startDate: "2024-02-05",
      endDate: "2024-02-05",
      status: "rejected" as const,
      days: 1,
      reason: "Personal matter",
    },
  ];

  const recentRequests = requests || defaultRequests;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-gradient-enhanced">
            Recent Requests
          </CardTitle>
          <Link href="/employee/leaves">
            <Button variant="ghost" size="sm">
              View all
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <AnimatePresence>
                      {request.status === "pending" && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-1 -right-1 w-3 h-3 bg-warning rounded-full"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{request.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {request.startDate} - {request.endDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      request.status === "approved"
                        ? "default"
                        : request.status === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                    className="text-xs"
                  >
                    {request.status}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Quick Actions Component
export function AnimatedQuickActions() {
  const actions = [
    {
      label: "Request Leave",
      icon: <Plus className="w-5 h-5" />,
      href: "/employee/leaves/new",
      color: "bg-primary",
      delay: 0.2,
    },
    {
      label: "View Calendar",
      icon: <Calendar className="w-5 h-5" />,
      href: "/calendar",
      color: "bg-success",
      delay: 0.3,
    },
    {
      label: "Team Status",
      icon: <Users className="w-5 h-5" />,
      href: "/calendar?view=team",
      color: "bg-warning",
      delay: 0.4,
    },
    {
      label: "Documents",
      icon: <FileText className="w-5 h-5" />,
      href: "/documents",
      color: "bg-info",
      delay: 0.5,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <Card className="glass-advanced">
        <CardHeader>
          <CardTitle className="text-gradient-enhanced">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {actions.map((action) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: action.delay,
                  duration: 0.3,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href={action.href}>
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group">
                    <div
                      className={cn(
                        "p-3 rounded-xl text-white group-hover:scale-110 transition-transform",
                        action.color
                      )}
                    >
                      {action.icon}
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
