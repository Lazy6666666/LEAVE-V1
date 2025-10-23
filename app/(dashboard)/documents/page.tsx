"use client";

import { useState, useEffect, useMemo } from "react";
import { Document, DocumentFilters } from "@/lib/types/document";
import { DocumentCardNew } from "@/components/documents/DocumentCardNew";
import { DocumentFiltersNew } from "@/components/documents/DocumentFiltersNew";
import { DocumentStats } from "@/components/documents/DocumentStats";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonCard } from "@/components/ui/enhanced-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Grid3X3,
  List,
  Download,
  Upload,
  CheckCircle,
  Clock,
} from "lucide-react";
import { mockDocuments, documentCategories } from "@/lib/mock/documents";
import { cn } from "@/lib/utils";

// Simulate user role - in a real app, this would come from auth context
const currentUserRole = "EMPLOYEE";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<DocumentFilters>({
    category: "",
    searchTerm: "",
    fileType: "",
    dateRange: {},
    showExpired: false,
    showRequired: false,
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Simulate loading documents
  useEffect(() => {
    const loadDocuments = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setDocuments(mockDocuments);
      setIsLoading(false);
    };

    loadDocuments();
  }, []);

  // Filter documents based on current filters
  const filteredDocuments = useMemo(() => {
    const filtered = documents.filter((doc) => {
      // Check role-based access
      const hasAccess =
        doc.requiredRoles.length === 0 ||
        doc.requiredRoles.includes(currentUserRole);
      if (!hasAccess) return false;

      // Category filter
      if (filters.category && doc.category.id !== filters.category) {
        return false;
      }

      // Search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesTitle = doc.title.toLowerCase().includes(searchLower);
        const matchesDescription = doc.description
          .toLowerCase()
          .includes(searchLower);
        const matchesTags = doc.tags.some((tag) =>
          tag.toLowerCase().includes(searchLower)
        );
        const matchesCategory = doc.category.name
          .toLowerCase()
          .includes(searchLower);

        if (
          !matchesTitle &&
          !matchesDescription &&
          !matchesTags &&
          !matchesCategory
        ) {
          return false;
        }
      }

      // File type filter
      if (
        filters.fileType &&
        !doc.fileType.includes(filters.fileType.replace("*", ""))
      ) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.from && doc.updatedAt < filters.dateRange.from) {
        return false;
      }
      if (filters.dateRange.to && doc.updatedAt > filters.dateRange.to) {
        return false;
      }

      // Show expired filter
      if (
        !filters.showExpired &&
        doc.expiryDate &&
        doc.expiryDate < new Date()
      ) {
        return false;
      }

      // Show required filter
      if (filters.showRequired && !doc.isRequired) {
        return false;
      }

      return true;
    });

    return filtered;
  }, [documents, filters]);

  // Get documents by category
  const documentsByCategory = useMemo(() => {
    const grouped: Record<string, Document[]> = {};

    documentCategories.forEach((category) => {
      grouped[category.id] = documents.filter(
        (doc) =>
          doc.category.id === category.id &&
          (doc.requiredRoles.length === 0 ||
            doc.requiredRoles.includes(currentUserRole))
      );
    });

    return grouped;
  }, [documents]);

  // Calculate stats
  const currentStats = useMemo(() => {
    const userDocuments = documents.filter(
      (doc) =>
        doc.requiredRoles.length === 0 ||
        doc.requiredRoles.includes(currentUserRole)
    );

    return {
      totalDocuments: userDocuments.length,
      requiredDocuments: userDocuments.filter((doc) => doc.isRequired).length,
      expiringSoon: userDocuments.filter((doc) => {
        if (!doc.expiryDate) return false;
        const daysUntilExpiry = Math.ceil(
          (doc.expiryDate.getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
      }).length,
      expired: userDocuments.filter(
        (doc) => doc.expiryDate && doc.expiryDate < new Date()
      ).length,
      categoriesCount: documentCategories.length,
      totalSize: userDocuments.reduce((total, doc) => total + doc.fileSize, 0),
    };
  }, [documents]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
            <p className="text-muted-foreground">
              Company documents and resources
            </p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="bg-white/10 backdrop-blur-md border-white/20"
            >
              <CardContent className="p-4">
                <Skeleton className="w-10 h-10 rounded-lg mx-auto mb-2" />
                <Skeleton className="h-8 w-16 mx-auto mb-1" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters Skeleton */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard
              key={i}
              showAvatar={true}
              showHeader={true}
              lines={3}
              showFooter={true}
              className="bg-white/10 backdrop-blur-md border-white/20"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Company documents and resources
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export List
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <DocumentStats stats={currentStats} />

      {/* Filters */}
      <DocumentFiltersNew
        filters={filters}
        onFiltersChange={setFilters}
        categories={documentCategories}
        totalCount={currentStats.totalDocuments}
        filteredCount={filteredDocuments.length}
      />

      {/* View Toggle and Results */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredDocuments.length} documents found
          </span>
          {filteredDocuments.length !== currentStats.totalDocuments && (
            <Badge variant="secondary" className="text-xs">
              Filtered
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Documents Display */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="required">Required</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
        </TabsList>

        {/* All Documents Tab */}
        <TabsContent value="all" className="space-y-6">
          {filteredDocuments.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  No documents found
                </h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filters to find what you&apos;re
                  looking for.
                </p>
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      category: "",
                      searchTerm: "",
                      fileType: "",
                      dateRange: {},
                      showExpired: false,
                      showRequired: false,
                    })
                  }
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div
              className={cn(
                "grid gap-6",
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              )}
            >
              {filteredDocuments.map((document) => (
                <DocumentCardNew
                  key={document.id}
                  document={document}
                  userRole={currentUserRole}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Required Documents Tab */}
        <TabsContent value="required" className="space-y-6">
          {filteredDocuments.filter((doc) => doc.isRequired).length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground">
                  You don&apos;t have any required documents to review at this
                  time.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div
              className={cn(
                "grid gap-6",
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              )}
            >
              {filteredDocuments
                .filter((doc) => doc.isRequired)
                .map((document) => (
                  <DocumentCardNew
                    key={document.id}
                    document={document}
                    userRole={currentUserRole}
                  />
                ))}
            </div>
          )}
        </TabsContent>

        {/* Expiring Soon Tab */}
        <TabsContent value="expiring" className="space-y-6">
          {filteredDocuments.filter((doc) => {
            if (!doc.expiryDate) return false;
            const daysUntilExpiry = Math.ceil(
              (doc.expiryDate.getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            );
            return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
          }).length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-12 text-center">
                <Clock className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <h3 className="text-lg font-semibold mb-2">
                  No expiring documents
                </h3>
                <p className="text-muted-foreground">
                  No documents are expiring in the next 30 days.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div
              className={cn(
                "grid gap-6",
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              )}
            >
              {filteredDocuments
                .filter((doc) => {
                  if (!doc.expiryDate) return false;
                  const daysUntilExpiry = Math.ceil(
                    (doc.expiryDate.getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
                })
                .map((document) => (
                  <DocumentCardNew
                    key={document.id}
                    document={document}
                    userRole={currentUserRole}
                  />
                ))}
            </div>
          )}
        </TabsContent>

        {/* By Category Tab */}
        <TabsContent value="categories" className="space-y-8">
          {documentCategories.map((category) => {
            const categoryDocuments = documentsByCategory[category.id] || [];
            if (categoryDocuments.length === 0) return null;

            return (
              <Card
                key={category.id}
                className="bg-white/10 backdrop-blur-md border-white/20"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h3 className="text-lg">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                    <Badge variant="secondary" className="ml-auto">
                      {categoryDocuments.length} documents
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={cn(
                      "grid gap-4",
                      viewMode === "grid"
                        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                        : "grid-cols-1"
                    )}
                  >
                    {categoryDocuments
                      .slice(0, viewMode === "grid" ? 6 : 3)
                      .map((document) => (
                        <DocumentCardNew
                          key={document.id}
                          document={document}
                          userRole={currentUserRole}
                        />
                      ))}
                    {categoryDocuments.length >
                      (viewMode === "grid" ? 6 : 3) && (
                      <Button
                        variant="outline"
                        className="h-full min-h-[200px] flex flex-col items-center justify-center gap-2 border-dashed"
                      >
                        <FileText className="w-8 h-8" />
                        <span>
                          View{" "}
                          {categoryDocuments.length -
                            (viewMode === "grid" ? 6 : 3)}{" "}
                          more
                        </span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
