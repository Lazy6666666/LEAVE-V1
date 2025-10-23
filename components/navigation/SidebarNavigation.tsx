"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  FileText,
  Home,
  LogOut,
  Settings,
  Users,
  Bell,
  ChevronRight,
  Briefcase,
  AlertCircle,
} from "lucide-react";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    badge: null,
  },
  {
    title: "Leave Management",
    href: "/dashboard/employee/leaves",
    icon: Briefcase,
    badge: null,
    children: [
      {
        title: "My Leaves",
        href: "/dashboard/employee/leaves",
        badge: "3 pending",
      },
      {
        title: "New Request",
        href: "/dashboard/employee/leaves/new",
        badge: null,
      },
      {
        title: "Approvals",
        href: "/dashboard/manager/approvals",
        badge: "5 pending",
      },
    ],
  },
  {
    title: "Calendar",
    href: "/dashboard/calendar",
    icon: Calendar,
    badge: null,
  },
  {
    title: "Documents",
    href: "/dashboard/documents",
    icon: FileText,
    badge: null,
  },
  {
    title: "Team",
    href: "/dashboard/team",
    icon: Users,
    badge: null,
  },
  {
    title: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
    badge: "12 new",
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    badge: null,
  },
  {
    title: "Help & Support",
    href: "/dashboard/help",
    icon: AlertCircle,
    badge: null,
  },
];

interface SidebarNavigationProps {
  className?: string;
}

export default function SidebarNavigation({
  className
}: SidebarNavigationProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([
    "Leave Management",
  ]);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  return (
    <div className={cn("flex h-full flex-col bg-gray-900", className)}>
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <span className="text-lg font-bold text-white">LH</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">LeaveHub</h2>
            <p className="text-xs text-gray-400">Management System</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">John Doe</p>
            <p className="text-xs text-gray-400">john.doe@company.com</p>
            <p className="text-xs text-gray-400">Employee</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const isExpanded = expandedItems.includes(item.title);
          const Icon = item.icon;

          if (item.children) {
            return (
              <div key={item.title}>
                <button
                  onClick={() => toggleExpanded(item.title)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{item.title}</span>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isExpanded && "rotate-90"
                    )}
                  />
                </button>
                {isExpanded && (
                  <div className="mt-1 ml-6 space-y-1">
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                            isChildActive
                              ? "bg-gray-800 text-white"
                              : "text-gray-400 hover:bg-gray-800 hover:text-white"
                          )}
                        >
                          <span className="flex-1">{child.title}</span>
                          {child.badge && (
                            <Badge
                              variant="secondary"
                              className="bg-gray-700 text-gray-300"
                            >
                              {child.badge}
                            </Badge>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}