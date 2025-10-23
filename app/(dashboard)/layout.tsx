"use client";

import { useState, useEffect, useRef } from "react";
import SidebarNavigation from "@/components/navigation/SidebarNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Bell,
  Menu,
  User,
  Settings,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // TODO: Implement actual theme switching
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <SidebarNavigation />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40 flex-shrink-0">
          <div className="h-full px-4 flex items-center justify-between">
            {/* Left side - Mobile menu toggle and search */}
            <div className="flex items-center gap-4 flex-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="lg:hidden"
              >
                <Menu className="w-4 h-4" />
              </Button>

              {/* Search Bar */}
              <div className="relative max-w-md flex-1 hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search leaves, documents, team members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 h-9 bg-background/50 backdrop-blur-sm border-border/50"
                />
              </div>
            </div>

            {/* Right side - Actions and user */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-muted-foreground hover:text-foreground"
                title="Toggle theme"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>

              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground relative"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </Button>
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-3 pl-3 border-l border-border">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-muted-foreground">Employee</p>
                </div>
                <div className="relative" ref={dropdownRef}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-sm font-medium">
                        JD
                      </span>
                    </div>
                  </Button>

                  {/* Dropdown Menu - Fixed positioning */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-popover border border-border rounded-md shadow-lg py-2 z-[100] min-w-[16rem] animate-in fade-in-0 zoom-in-95 duration-200">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-medium whitespace-nowrap">
                          John Doe
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          john.doe@company.com
                        </p>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          Employee
                        </Badge>
                      </div>

                      <div className="py-1">
                        <Button
                          variant="ghost"
                          className="w-full justify-start px-4 py-2 text-sm hover:bg-accent"
                        >
                          <User className="w-4 h-4 mr-3" />
                          Profile
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start px-4 py-2 text-sm hover:bg-accent"
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Settings
                        </Button>
                        <div className="border-t border-border my-1"></div>
                        <Button
                          variant="ghost"
                          className="w-full justify-start px-4 py-2 text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign out
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area - Fixed overflow */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto bg-background/50"
        >
          <div className="container mx-auto px-4 py-6 max-w-7xl min-h-full">
            {children}
          </div>
        </main>

        {/* Mobile Search Overlay */}
        <div className="md:hidden fixed inset-0 bg-background/95 backdrop-blur-sm z-50 hidden">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  /* Close mobile search */
                }}
              >
                <Menu className="w-4 h-4" />
              </Button>
              <h2 className="text-lg font-semibold">Search</h2>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-11"
                autoFocus
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
