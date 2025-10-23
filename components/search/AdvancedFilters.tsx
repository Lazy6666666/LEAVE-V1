"use client";

import { useState } from "react";
// Optimized lucide-react imports for tree-shaking
import {
  Filter,
  X,
  Calendar,
  User,
  FileText,
} from "@/lib/utils/icons";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export interface SearchFilters {
  type?: string[];
  dateFrom?: string;
  dateTo?: string;
  status?: string[];
  category?: string[];
  department?: string[];
}

interface AdvancedFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClear: () => void;
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  onClear,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
  ).length;

  const handleTypeToggle = (type: string) => {
    const current = filters.type || [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onFiltersChange({ ...filters, type: updated });
  };

  const handleStatusToggle = (status: string) => {
    const current = filters.status || [];
    const updated = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    onFiltersChange({ ...filters, status: updated });
  };

  const handleCategoryToggle = (category: string) => {
    const current = filters.category || [];
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    onFiltersChange({ ...filters, category: updated });
  };

  const types = [
    { value: "leave", label: "Leave Requests", icon: Calendar },
    { value: "document", label: "Documents", icon: FileText },
    { value: "user", label: "Users", icon: User },
    { value: "calendar", label: "Calendar Events", icon: Calendar },
  ];

  const statuses = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];
  const categories = [
    "Policy",
    "Form",
    "Contract",
    "Certificate",
    "Report",
    "Other",
  ];
  const departments = [
    "Engineering",
    "HR",
    "Sales",
    "Marketing",
    "Finance",
    "Operations",
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Advanced Filters</SheetTitle>
          <SheetDescription>
            Refine your search with advanced filtering options
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Content Type */}
          <div className="space-y-3">
            <Label>Content Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {types.map((type) => {
                const Icon = type.icon;
                const isSelected = filters.type?.includes(type.value);
                return (
                  <button
                    key={type.value}
                    onClick={() => handleTypeToggle(type.value)}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <Label>Date Range</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label
                  htmlFor="dateFrom"
                  className="text-xs text-muted-foreground"
                >
                  From
                </Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom || ""}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, dateFrom: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="dateTo"
                  className="text-xs text-muted-foreground"
                >
                  To
                </Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo || ""}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, dateTo: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Status (for leave requests) */}
          {(!filters.type ||
            filters.type.includes("leave") ||
            filters.type.includes("calendar")) && (
            <div className="space-y-3">
              <Label>Status</Label>
              <div className="space-y-2">
                {statuses.map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={filters.status?.includes(status)}
                      onCheckedChange={() => handleStatusToggle(status)}
                    />
                    <Label
                      htmlFor={`status-${status}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {status}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category (for documents) */}
          {(!filters.type || filters.type.includes("document")) && (
            <div className="space-y-3">
              <Label>Document Category</Label>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={filters.category?.includes(category)}
                      onCheckedChange={() => handleCategoryToggle(category)}
                    />
                    <Label
                      htmlFor={`category-${category}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Department */}
          <div className="space-y-3">
            <Label>Department</Label>
            <Select
              value={filters.department?.[0] || ""}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  department: value ? [value] : [],
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Active Filters</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClear}
                  className="h-auto p-1 text-xs"
                >
                  Clear all
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.type?.map((type) => (
                  <Badge key={type} variant="secondary">
                    {type}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => handleTypeToggle(type)}
                    />
                  </Badge>
                ))}
                {filters.status?.map((status) => (
                  <Badge key={status} variant="secondary">
                    {status}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => handleStatusToggle(status)}
                    />
                  </Badge>
                ))}
                {filters.category?.map((category) => (
                  <Badge key={category} variant="secondary">
                    {category}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => handleCategoryToggle(category)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button className="flex-1" onClick={() => setIsOpen(false)}>
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
