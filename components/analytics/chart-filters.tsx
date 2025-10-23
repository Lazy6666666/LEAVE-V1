"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Filter, RefreshCw, Download, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface ChartFiltersProps {
  onFiltersChange: (filters: ChartFiltersState) => void;
  onExport: () => void;
  onRefresh: () => void;
  className?: string;
}

export interface ChartFiltersState {
  period: string;
  department: string;
  leaveType: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  comparisonMode: boolean;
}

export default function ChartFilters({
  onFiltersChange,
  onExport,
  onRefresh,
  className,
}: ChartFiltersProps) {
  const [filters, setFilters] = useState<ChartFiltersState>({
    period: "year",
    department: "all",
    leaveType: "all",
    dateRange: {
      from: undefined,
      to: undefined,
    },
    comparisonMode: false,
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleFilterChange = (key: keyof ChartFiltersState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateRangeChange = (
    range: { from?: Date; to?: Date } | undefined
  ) => {
    const newFilters = {
      ...filters,
      dateRange: {
        from: range?.from,
        to: range?.to,
      },
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters: ChartFiltersState = {
      period: "year",
      department: "all",
      leaveType: "all",
      dateRange: { from: undefined, to: undefined },
      comparisonMode: false,
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const activeFiltersCount = [
    filters.period !== "year",
    filters.department !== "all",
    filters.leaveType !== "all",
    filters.dateRange.from || filters.dateRange.to,
    filters.comparisonMode,
  ].filter(Boolean).length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Chart Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFiltersCount} active
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Customize your analytics view</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Advanced
            </Button>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Period Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Time Period</label>
            <Select
              value={filters.period}
              onValueChange={(value) => handleFilterChange("period", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="last_year">Last Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Department Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Department</label>
            <Select
              value={filters.department}
              onValueChange={(value) => handleFilterChange("department", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="hr">Human Resources</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
                <SelectItem value="support">Customer Support</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Leave Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Leave Type</label>
            <Select
              value={filters.leaveType}
              onValueChange={(value) => handleFilterChange("leaveType", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="annual">Annual Leave</SelectItem>
                <SelectItem value="sick">Sick Leave</SelectItem>
                <SelectItem value="personal">Personal Leave</SelectItem>
                <SelectItem value="maternity">Maternity/Paternity</SelectItem>
                <SelectItem value="study">Study Leave</SelectItem>
                <SelectItem value="compassionate">Compassionate</SelectItem>
                <SelectItem value="unpaid">Unpaid Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                        {format(filters.dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(filters.dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{
                    from: filters.dateRange.from,
                    to: filters.dateRange.to,
                  }}
                  onSelect={handleDateRangeChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Clear Filters */}
          <div className="space-y-2">
            <label className="text-sm font-medium invisible">Actions</label>
            <Button
              variant="outline"
              className="w-full"
              onClick={clearFilters}
              disabled={activeFiltersCount === 0}
            >
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Comparison Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Comparison Mode</h4>
                  <p className="text-xs text-muted-foreground">
                    Compare data with previous period
                  </p>
                </div>
                <Button
                  variant={filters.comparisonMode ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    handleFilterChange(
                      "comparisonMode",
                      !filters.comparisonMode
                    )
                  }
                >
                  {filters.comparisonMode ? "Enabled" : "Disabled"}
                </Button>
              </div>

              {/* Quick Date Presets */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Quick Presets</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const now = new Date();
                      const lastMonth = new Date(
                        now.getFullYear(),
                        now.getMonth() - 1,
                        1
                      );
                      handleDateRangeChange({ from: lastMonth, to: now });
                    }}
                  >
                    Last 30 Days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const now = new Date();
                      const lastQuarter = new Date(
                        now.getFullYear(),
                        now.getMonth() - 3,
                        1
                      );
                      handleDateRangeChange({ from: lastQuarter, to: now });
                    }}
                  >
                    Last Quarter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const now = new Date();
                      const lastYear = new Date(now.getFullYear() - 1, 0, 1);
                      handleDateRangeChange({ from: lastYear, to: now });
                    }}
                  >
                    Last Year
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {activeFiltersCount > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Active Filters:</h4>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.period !== "year" && (
                <Badge variant="secondary" className="text-xs">
                  Period: {filters.period}
                </Badge>
              )}
              {filters.department !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  Department: {filters.department}
                </Badge>
              )}
              {filters.leaveType !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  Type: {filters.leaveType}
                </Badge>
              )}
              {filters.dateRange.from && (
                <Badge variant="secondary" className="text-xs">
                  Range: {format(filters.dateRange.from, "MMM dd")} -{" "}
                  {filters.dateRange.to
                    ? format(filters.dateRange.to, "MMM dd")
                    : "Now"}
                </Badge>
              )}
              {filters.comparisonMode && (
                <Badge variant="secondary" className="text-xs">
                  Comparison Mode
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
