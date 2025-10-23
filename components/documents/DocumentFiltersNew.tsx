"use client";

import { useState } from "react";
import {
  DocumentFilters as DocumentFiltersType,
  DocumentCategory,
} from "@/lib/types/document";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Filter,
  X,
  Calendar,
  FileText,
  Clock,
  AlertTriangle,
} from "lucide-react";

interface DocumentFiltersProps {
  filters: DocumentFiltersType;
  onFiltersChange: (filters: DocumentFiltersType) => void;
  categories: DocumentCategory[];
  totalCount: number;
  filteredCount: number;
}

export function DocumentFiltersNew({
  filters,
  onFiltersChange,
  categories,
  totalCount,
  filteredCount,
}: DocumentFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = (searchTerm: string) => {
    onFiltersChange({ ...filters, searchTerm });
  };

  const handleCategoryChange = (category: string) => {
    onFiltersChange({ ...filters, category });
  };

  const handleFileTypeChange = (fileType: string) => {
    onFiltersChange({ ...filters, fileType });
  };

  const handleShowExpiredChange = (showExpired: boolean) => {
    onFiltersChange({ ...filters, showExpired });
  };

  const handleShowRequiredChange = (showRequired: boolean) => {
    onFiltersChange({ ...filters, showRequired });
  };

  const handleDateRangeChange = (type: "from" | "to", value: string) => {
    const date = value ? new Date(value) : undefined;
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [type]: date,
      },
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      category: "",
      searchTerm: "",
      fileType: "",
      dateRange: {},
      showExpired: false,
      showRequired: false,
    });
  };

  const hasActiveFilters =
    filters.category ||
    filters.searchTerm ||
    filters.fileType ||
    filters.showExpired ||
    filters.showRequired ||
    filters.dateRange.from ||
    filters.dateRange.to;

  const fileTypes = [
    { value: "application/pdf", label: "PDF Documents" },
    {
      value:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      label: "Excel Spreadsheets",
    },
    {
      value:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      label: "Word Documents",
    },
    { value: "image/*", label: "Images" },
  ];

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Document Filters
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs"
            >
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
          </div>
        </div>

        {/* Results summary */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Showing {filteredCount} of {totalCount} documents
          </span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              Active filters
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search documents by title, description, or tags..."
            value={filters.searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 bg-background/50 backdrop-blur-sm border-white/20"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.showRequired ? "default" : "outline"}
            size="sm"
            onClick={() => handleShowRequiredChange(!filters.showRequired)}
            className="text-xs"
          >
            <AlertTriangle className="w-3 h-3 mr-1" />
            Required Only
          </Button>
          <Button
            variant={filters.showExpired ? "default" : "outline"}
            size="sm"
            onClick={() => handleShowExpiredChange(!filters.showExpired)}
            className="text-xs"
          >
            <Clock className="w-3 h-3 mr-1" />
            Include Expired
          </Button>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Category
                </label>
                <Select
                  value={filters.category}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="bg-background/50 backdrop-blur-sm border-white/20">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                          <Badge variant="outline" className="text-xs ml-auto">
                            {category.documentCount}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">File Type</label>
                <Select
                  value={filters.fileType}
                  onValueChange={handleFileTypeChange}
                >
                  <SelectTrigger className="bg-background/50 backdrop-blur-sm border-white/20">
                    <SelectValue placeholder="All file types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All file types</SelectItem>
                    {fileTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date Range
                </label>
                <div className="space-y-2">
                  <Input
                    type="date"
                    placeholder="From date"
                    value={
                      filters.dateRange.from?.toISOString().split("T")[0] || ""
                    }
                    onChange={(e) =>
                      handleDateRangeChange("from", e.target.value)
                    }
                    className="bg-background/50 backdrop-blur-sm border-white/20 text-xs"
                  />
                  <Input
                    type="date"
                    placeholder="To date"
                    value={
                      filters.dateRange.to?.toISOString().split("T")[0] || ""
                    }
                    onChange={(e) =>
                      handleDateRangeChange("to", e.target.value)
                    }
                    className="bg-background/50 backdrop-blur-sm border-white/20 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Filter Tags */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-white/20">
                {filters.category && (
                  <Badge variant="secondary" className="text-xs">
                    Category:{" "}
                    {categories.find((c) => c.id === filters.category)?.name}
                  </Badge>
                )}
                {filters.fileType && (
                  <Badge variant="secondary" className="text-xs">
                    Type:{" "}
                    {fileTypes.find((t) => t.value === filters.fileType)?.label}
                  </Badge>
                )}
                {filters.showRequired && (
                  <Badge variant="secondary" className="text-xs">
                    Required documents only
                  </Badge>
                )}
                {filters.showExpired && (
                  <Badge variant="secondary" className="text-xs">
                    Including expired
                  </Badge>
                )}
                {filters.dateRange.from && (
                  <Badge variant="secondary" className="text-xs">
                    From: {filters.dateRange.from.toLocaleDateString()}
                  </Badge>
                )}
                {filters.dateRange.to && (
                  <Badge variant="secondary" className="text-xs">
                    To: {filters.dateRange.to.toLocaleDateString()}
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
