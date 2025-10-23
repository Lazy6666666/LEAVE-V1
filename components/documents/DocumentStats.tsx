"use client";

import type { DocumentStats } from "@/lib/types/document";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  AlertTriangle,
  Clock,
  Archive,
  HardDrive,
  Folder,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentStatsProps {
  stats: DocumentStats;
  className?: string;
}

export function DocumentStats({ stats, className }: DocumentStatsProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const statItems = [
    {
      title: "Total Documents",
      value: stats.totalDocuments,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Required Reading",
      value: stats.requiredDocuments,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
    },
    {
      title: "Expiring Soon",
      value: stats.expiringSoon,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
    {
      title: "Expired",
      value: stats.expired,
      icon: Archive,
      color: "text-gray-600",
      bgColor: "bg-gray-100 dark:bg-gray-900/20",
    },
    {
      title: "Categories",
      value: stats.categoriesCount,
      icon: Folder,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Total Storage",
      value: formatFileSize(stats.totalSize),
      icon: HardDrive,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4",
        className
      )}
    >
      {statItems.map((item, index) => (
        <Card
          key={index}
          className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300"
        >
          <CardContent className="p-4 text-center">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2",
                item.bgColor
              )}
            >
              <item.icon className={cn("w-5 h-5", item.color)} />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.title}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
