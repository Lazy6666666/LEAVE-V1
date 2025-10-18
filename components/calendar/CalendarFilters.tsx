"use client";

// Calendar Filters Component - Filter calendar by user, department, leave type

import { useState } from "react";

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

  return (
    <div className="rounded-lg border bg-card/50 backdrop-blur-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset Filters
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            {showFilters ? "Hide" : "Show"} Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          {/* Team Members Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Team Members</label>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {teamMembers.map((member) => (
                <label
                  key={member.id}
                  className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.userIds.includes(member.id)}
                    onChange={() => handleUserChange(member.id)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{member.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Departments Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Departments</label>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {departments.map((department) => (
                <label
                  key={department}
                  className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.departments.includes(department)}
                    onChange={() => handleDepartmentChange(department)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{department}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Leave Types Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Leave Types</label>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {leaveTypes.map((leaveType) => (
                <label
                  key={leaveType.id}
                  className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.leaveTypeIds.includes(leaveType.id)}
                    onChange={() => handleLeaveTypeChange(leaveType.id)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{leaveType.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
