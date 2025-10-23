"use client";

import { useState } from "react";
import { Document } from "@/lib/types/document";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  Download,
  Eye,
  FileText,
  Clock,
  AlertTriangle,
  User,
  HardDrive,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentCardProps {
  document: Document;
  userRole?: string;
}

export function DocumentCardNew({
  document,
  userRole = "EMPLOYEE",
}: DocumentCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Check if user has access to this document
  const hasAccess =
    document.requiredRoles.length === 0 ||
    document.requiredRoles.includes(userRole);

  // Check if document is expired
  const isExpired = document.expiryDate && document.expiryDate < new Date();

  // Check if document is expiring soon (within 30 days)
  const isExpiringSoon =
    document.expiryDate &&
    !isExpired &&
    Math.ceil(
      (document.expiryDate.getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    ) <= 30;

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Get file icon based on type
  const getFileIcon = () => {
    switch (document.fileType) {
      case "application/pdf":
        return <FileText className="w-4 h-4" />;
      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        return <FileText className="w-4 h-4" />;
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Simulate download
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // In a real app, this would trigger an actual download
      console.log(`Downloading: ${document.fileName}`);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  if (!hasAccess) {
    return null;
  }

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg",
        "bg-white/10 backdrop-blur-md border-white/20",
        "hover:bg-white/15 hover:border-white/30",
        "hover:scale-[1.02] hover:-translate-y-1"
      )}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                document.category.color,
                "text-white"
              )}
            >
              {getFileIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {document.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {document.description}
              </p>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex flex-col items-end gap-2">
            {document.isRequired && (
              <Badge variant="destructive" className="text-xs">
                Required
              </Badge>
            )}
            {isExpired && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Expired
              </Badge>
            )}
            {isExpiringSoon && !isExpired && (
              <Badge
                variant="secondary"
                className="text-xs bg-orange-500/20 text-orange-600 border-orange-500/30"
              >
                <Clock className="w-3 h-3 mr-1" />
                Expires Soon
              </Badge>
            )}
          </div>
        </div>

        {/* Category and Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge variant="outline" className="text-xs">
            <span className="mr-1">{document.category.icon}</span>
            {document.category.name}
          </Badge>
          {document.tags.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {document.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{document.tags.length - 2} more
            </Badge>
          )}
        </div>

        {/* Metadata */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            <span>{document.uploadedBy}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>Updated {document.updatedAt.toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <HardDrive className="w-3 h-3" />
            <span>{formatFileSize(document.fileSize)}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Download className="w-3 h-3" />
            <span>{document.downloadCount} downloads</span>
          </div>

          {document.expiryDate && (
            <div
              className={cn(
                "flex items-center gap-2 text-xs",
                isExpired
                  ? "text-destructive"
                  : isExpiringSoon
                    ? "text-orange-600"
                    : "text-muted-foreground"
              )}
            >
              <Clock className="w-3 h-3" />
              <span>
                {isExpired ? "Expired" : "Expires"}{" "}
                {document.expiryDate.toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={handleDownload}
            disabled={isDownloading || isExpired}
          >
            <Download className="w-3 h-3 mr-1" />
            {isDownloading ? "Downloading..." : "Download"}
          </Button>

          {document.previewAvailable && (
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreview}
                  disabled={isExpired}
                >
                  <Eye className="w-3 h-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {document.title}
                  </DialogTitle>
                  <DialogDescription>
                    Version {document.version} • Last updated{" "}
                    {document.updatedAt.toLocaleDateString()}
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                  {/* Document Preview Content */}
                  <div className="bg-muted/50 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">
                        Document preview would be displayed here
                      </p>
                      <Button onClick={handleDownload}>
                        <Download className="w-4 h-4 mr-2" />
                        Download Full Document
                      </Button>
                    </div>
                  </div>

                  {/* Document Details */}
                  <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">File Name:</span>{" "}
                      {document.fileName}
                    </div>
                    <div>
                      <span className="font-medium">File Size:</span>{" "}
                      {formatFileSize(document.fileSize)}
                    </div>
                    <div>
                      <span className="font-medium">Uploaded By:</span>{" "}
                      {document.uploadedBy}
                    </div>
                    <div>
                      <span className="font-medium">Version:</span>{" "}
                      {document.version}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          <Button
            variant="outline"
            size="sm"
            disabled={!document.previewAvailable || isExpired}
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
