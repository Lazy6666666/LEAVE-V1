"use client";

// Calendar Filters Component - Filter calendar by user, department, leave type

import { useState } from "react";
import {
  Filter,
  Users,
  Building2,
  CalendarDays,
  RotateCcw,
} from "lucide-react";
import { LEAVE_TYPE_COLORS } from "@/types/calendar";

interface CalendarFiltersProps {
  leaveTypes: { id: string; name: string }[];
  departments: string[];
  teamMembers: { id: string; name: string; department?: string }[];
  filters: {
    userIds: string[];
    leaveTypeIds: string[];
    departments: string[];
  };
  onFiltersChange: (filters: {
    userIds: string[];
    leaveTypeIds: string[];
    departments: string[];
  }) => void;
}

export default function CalendarFilters({
  leaveTypes,
  departments,
  teamMembers,
  filters,
  onFiltersChange,
}: CalendarFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleUserChange = (userId: string) => {
    const newUserIds = filters.userIds.includes(userId)
      ? filters.userIds.filter((id) => id !== userId)
      : [...filters.userIds, userId];

    onFiltersChange({ ...filters, userIds: newUserIds });
  };

  const handleDepartmentChange = (department: string) => {
    const newDepartments = filters.departments.includes(department)
      ? filters.departments.filter((d) => d !== department)
      : [...filters.departments, department];

    onFiltersChange({ ...filters, departments: newDepartments });
  };

  const handleLeaveTypeChange = (leaveTypeId: string) => {
    const newLeaveTypeIds = filters.leaveTypeIds.includes(leaveTypeId)
      ? filters.leaveTypeIds.filter((id) => id !== leaveTypeId)
      : [...filters.leaveTypeIds, leaveTypeId];

    onFiltersChange({ ...filters, leaveTypeIds: newLeaveTypeIds });
  };

  const handleResetFilters = () => {
    onFiltersChange({
      userIds: [],
      leaveTypeIds: [],
      departments: [],
    });
  };

  const activeFilterCount =
    filters.userIds.length +
    filters.departments.length +
    filters.leaveTypeIds.length;

  // Helper function to get leave type color
  const getLeaveTypeColor = (leaveTypeName: string): string => {
    return LEAVE_TYPE_COLORS[leaveTypeName] || LEAVE_TYPE_COLORS.Annual;
  };

  return (
    <div className="glass-card border-2 p-4 space-y-4 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-lg">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground animate-pulse">
              {activeFilterCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors hover:bg-accent px-2 py-1 rounded-md"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors hover:bg-accent px-2 py-1 rounded-md"
          >
            {showFilters ? "Hide" : "Show"} Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/50">
          {/* Team Members Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <label className="text-sm font-semibold">Team Members</label>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {teamMembers.length}
              </span>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto modern-scrollbar pr-2">
              {teamMembers.map((member) => (
                <label
                  key={member.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/50 cursor-pointer transition-all duration-200 border border-transparent hover:border-border/50"
                >
                  <input
                    type="checkbox"
                    checked={filters.userIds.includes(member.id)}
                    onChange={() => handleUserChange(member.id)}
                    className="rounded border-gray-300 text-primary focus:ring-primary focus:ring-2"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{member.name}</span>
                    {member.department && (
                      <span className="text-xs text-muted-foreground block">
                        {member.department}
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Departments Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <label className="text-sm font-semibold">Departments</label>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {departments.length}
              </span>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto modern-scrollbar pr-2">
              {departments.map((department) => (
                <label
                  key={department}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/50 cursor-pointer transition-all duration-200 border border-transparent hover:border-border/50"
                >
                  <input
                    type="checkbox"
                    checked={filters.departments.includes(department)}
                    onChange={() => handleDepartmentChange(department)}
                    className="rounded border-gray-300 text-primary focus:ring-primary focus:ring-2"
                  />
                  <span className="text-sm font-medium">{department}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Leave Types Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <label className="text-sm font-semibold">Leave Types</label>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {leaveTypes.length}
              </span>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto modern-scrollbar pr-2">
              {leaveTypes.map((leaveType) => (
                <label
                  key={leaveType.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/50 cursor-pointer transition-all duration-200 border border-transparent hover:border-border/50"
                >
                  <input
                    type="checkbox"
                    checked={filters.leaveTypeIds.includes(leaveType.id)}
                    onChange={() => handleLeaveTypeChange(leaveType.id)}
                    className="rounded border-gray-300 text-primary focus:ring-primary focus:ring-2"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: getLeaveTypeColor(leaveType.name),
                      }}
                    />
                    <span className="text-sm font-medium">
                      {leaveType.name}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
