/**
 * Leave Status Badge Component
 * Visual indicator for leave request status
 */

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, Ban } from "lucide-react";

type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

interface LeaveStatusBadgeProps {
  status: LeaveStatus;
  className?: string;
}

const statusConfig = {
  PENDING: {
    label: "Pending",
    variant: "secondary" as const,
    icon: Clock,
    className:
      "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/50",
  },
  APPROVED: {
    label: "Approved",
    variant: "default" as const,
    icon: CheckCircle2,
    className:
      "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/50",
  },
  REJECTED: {
    label: "Rejected",
    variant: "destructive" as const,
    icon: XCircle,
    className: "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/50",
  },
  CANCELLED: {
    label: "Cancelled",
    variant: "outline" as const,
    icon: Ban,
    className:
      "bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/50",
  },
};

export function LeaveStatusBadge({ status, className }: LeaveStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${className || ""} flex items-center gap-1.5 px-3 py-1`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}
