"use client";

import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SearchFilters } from "./AdvancedFilters";

interface SearchPreset {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  filters: SearchFilters;
  color: string;
}

const presets: SearchPreset[] = [
  {
    id: "my-pending-leaves",
    title: "My Pending Leaves",
    description: "View all your pending leave requests",
    icon: Clock,
    filters: {
      type: ["leave"],
      status: ["PENDING"],
    },
    color: "from-yellow-500/20 to-orange-500/20",
  },
  {
    id: "approved-leaves",
    title: "Approved Leaves",
    description: "All approved leave requests",
    icon: CheckCircle,
    filters: {
      type: ["leave"],
      status: ["APPROVED"],
    },
    color: "from-green-500/20 to-emerald-500/20",
  },
  {
    id: "recent-documents",
    title: "Recent Documents",
    description: "Documents uploaded in the last 30 days",
    icon: FileText,
    filters: {
      type: ["document"],
      dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    id: "upcoming-leaves",
    title: "Upcoming Leaves",
    description: "Leave requests starting soon",
    icon: Calendar,
    filters: {
      type: ["calendar"],
      status: ["APPROVED"],
      dateFrom: new Date().toISOString().split("T")[0],
    },
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    id: "team-members",
    title: "Team Members",
    description: "Search all team members",
    icon: Users,
    filters: {
      type: ["user"],
    },
    color: "from-indigo-500/20 to-violet-500/20",
  },
  {
    id: "rejected-leaves",
    title: "Rejected Requests",
    description: "View rejected leave requests",
    icon: XCircle,
    filters: {
      type: ["leave"],
      status: ["REJECTED"],
    },
    color: "from-red-500/20 to-rose-500/20",
  },
];

interface SearchPresetsProps {
  onPresetSelect: (filters: SearchFilters) => void;
}

export function SearchPresets({ onPresetSelect }: SearchPresetsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">
        Quick Filters
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {presets.map((preset) => {
          const Icon = preset.icon;
          return (
            <Card
              key={preset.id}
              className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg overflow-hidden group"
              onClick={() => onPresetSelect(preset.filters)}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${preset.color} opacity-50 group-hover:opacity-70 transition-opacity`}
              />
              <CardContent className="relative p-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-background/80 backdrop-blur">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold">{preset.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {preset.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
