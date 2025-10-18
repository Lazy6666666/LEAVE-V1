"use client";

/**
 * Document Filters Component
 * T-026: Search and filter UI for documents
 */

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Calendar as CalendarIcon,
} from "lucide-react";
import { DOCUMENT_CATEGORIES } from "@/types/document";
// AccessLevel enum from Prisma
enum AccessLevel {
  PUBLIC = "PUBLIC",
  EMPLOYEE = "EMPLOYEE",
  MANAGER = "MANAGER",
  ADMIN = "ADMIN",
  HR = "HR",
}

export interface DocumentFilterState {
  search: string;
  categories: string[];
  tags: string[];
  uploaders: string[];
  dateFrom: string;
  dateTo: string;
  expiryStatus: "all" | "expiring" | "expired";
  accessLevel?: AccessLevel;
  sortBy: "title" | "uploadedAt" | "fileSize" | "category";
  sortOrder: "asc" | "desc";
}

interface DocumentFiltersProps {
  filters: DocumentFilterState;
  onFiltersChange: (filters: DocumentFilterState) => void;
  availableTags?: string[];
  availableUploaders?: { id: string; name: string }[];
}

export function DocumentFilters({
  filters,
  onFiltersChange,
  availableTags = [],
  availableUploaders = [],
}: DocumentFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFiltersChange({ ...filters, search: searchInput });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Count active filters
  const activeFilterCount =
    filters.categories.length +
    filters.tags.length +
    filters.uploaders.length +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0) +
    (filters.expiryStatus !== "all" ? 1 : 0) +
    (filters.accessLevel ? 1 : 0);

  const handleClearFilters = () => {
    setSearchInput("");
    onFiltersChange({
      search: "",
      categories: [],
      tags: [],
      uploaders: [],
      dateFrom: "",
      dateTo: "",
      expiryStatus: "all",
      accessLevel: undefined,
      sortBy: "uploadedAt",
      sortOrder: "desc",
    });
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onFiltersChange({ ...filters, tags: newTags });
  };

  const toggleUploader = (uploaderId: string) => {
    const newUploaders = filters.uploaders.includes(uploaderId)
      ? filters.uploaders.filter((u) => u !== uploaderId)
      : [...filters.uploaders, uploaderId];
    onFiltersChange({ ...filters, uploaders: newUploaders });
  };

  const removeFilter = (type: keyof DocumentFilterState, value?: string) => {
    switch (type) {
      case "categories":
        onFiltersChange({
          ...filters,
          categories: value
            ? filters.categories.filter((c) => c !== value)
            : [],
        });
        break;
      case "tags":
        onFiltersChange({
          ...filters,
          tags: value ? filters.tags.filter((t) => t !== value) : [],
        });
        break;
      case "uploaders":
        onFiltersChange({
          ...filters,
          uploaders: value ? filters.uploaders.filter((u) => u !== value) : [],
        });
        break;
      case "dateFrom":
        onFiltersChange({ ...filters, dateFrom: "" });
        break;
      case "dateTo":
        onFiltersChange({ ...filters, dateTo: "" });
        break;
      case "expiryStatus":
        onFiltersChange({ ...filters, expiryStatus: "all" });
        break;
      case "accessLevel":
        onFiltersChange({ ...filters, accessLevel: undefined });
        break;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar and Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search documents by title or description..."
            className="w-full pl-10 pr-10 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex gap-2">
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split("-") as [
                typeof filters.sortBy,
                typeof filters.sortOrder,
              ];
              onFiltersChange({ ...filters, sortBy, sortOrder });
            }}
            className="px-4 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="uploadedAt-desc">Newest First</option>
            <option value="uploadedAt-asc">Oldest First</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
            <option value="fileSize-desc">Largest First</option>
            <option value="fileSize-asc">Smallest First</option>
            <option value="category-asc">Category A-Z</option>
          </select>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Filter className="h-5 w-5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Active Filters Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Active filters:
          </span>
          {filters.categories.map((category) => (
            <button
              key={category}
              onClick={() => removeFilter("categories", category)}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              {category}
              <X className="h-3 w-3" />
            </button>
          ))}
          {filters.tags.map((tag) => (
            <button
              key={tag}
              onClick={() => removeFilter("tags", tag)}
              className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            >
              #{tag}
              <X className="h-3 w-3" />
            </button>
          ))}
          {filters.uploaders.map((uploaderId) => {
            const uploader = availableUploaders.find(
              (u) => u.id === uploaderId
            );
            return (
              <button
                key={uploaderId}
                onClick={() => removeFilter("uploaders", uploaderId)}
                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
              >
                {uploader?.name || "Unknown"}
                <X className="h-3 w-3" />
              </button>
            );
          })}
          {(filters.dateFrom || filters.dateTo) && (
            <button
              onClick={() => {
                removeFilter("dateFrom");
                removeFilter("dateTo");
              }}
              className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-sm hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
            >
              <CalendarIcon className="h-3 w-3" />
              Date Range
              <X className="h-3 w-3" />
            </button>
          )}
          {filters.expiryStatus !== "all" && (
            <button
              onClick={() => removeFilter("expiryStatus")}
              className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full text-sm hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
            >
              {filters.expiryStatus === "expiring"
                ? "Expiring Soon"
                : "Expired"}
              <X className="h-3 w-3" />
            </button>
          )}
          {filters.accessLevel && (
            <button
              onClick={() => removeFilter("accessLevel")}
              className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
            >
              {filters.accessLevel} Access
              <X className="h-3 w-3" />
            </button>
          )}
          <button
            onClick={handleClearFilters}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Collapsible Filter Panel */}
      {showFilters && (
        <div className="rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Category Filter */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Categories
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {DOCUMENT_CATEGORIES.map((category) => (
                  <label
                    key={category}
                    className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="rounded text-primary"
                    />
                    <span className="text-sm">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags Filter */}
            {availableTags.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Tags
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableTags.map((tag) => (
                    <label
                      key={tag}
                      className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={filters.tags.includes(tag)}
                        onChange={() => toggleTag(tag)}
                        className="rounded text-primary"
                      />
                      <span className="text-sm">#{tag}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Uploader Filter */}
            {availableUploaders.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Uploaded By
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableUploaders.map((uploader) => (
                    <label
                      key={uploader.id}
                      className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={filters.uploaders.includes(uploader.id)}
                        onChange={() => toggleUploader(uploader.id)}
                        className="rounded text-primary"
                      />
                      <span className="text-sm">{uploader.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Date Range and Other Filters */}
            <div className="space-y-4">
              {/* Date Range */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Upload Date
                </h3>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, dateFrom: e.target.value })
                  }
                  placeholder="From"
                  className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg text-sm"
                />
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, dateTo: e.target.value })
                  }
                  placeholder="To"
                  className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg text-sm"
                />
              </div>

              {/* Expiry Status */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Expiry Status
                </h3>
                <select
                  value={filters.expiryStatus}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      expiryStatus: e.target
                        .value as DocumentFilterState["expiryStatus"],
                    })
                  }
                  className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg text-sm"
                >
                  <option value="all">All Documents</option>
                  <option value="expiring">Expiring Soon (30 days)</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              {/* Access Level */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Access Level
                </h3>
                <select
                  value={filters.accessLevel || ""}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      accessLevel: e.target.value
                        ? (e.target.value as AccessLevel)
                        : undefined,
                    })
                  }
                  className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg text-sm"
                >
                  <option value="">All Levels</option>
                  <option value={AccessLevel.PUBLIC}>Public</option>
                  <option value={AccessLevel.EMPLOYEE}>Employee</option>
                  <option value={AccessLevel.MANAGER}>Manager</option>
                  <option value={AccessLevel.HR}>HR</option>
                  <option value={AccessLevel.ADMIN}>Admin</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
