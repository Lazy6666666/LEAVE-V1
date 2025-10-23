export interface Document {
  id: string;
  title: string;
  description: string;
  category: DocumentCategory;
  fileUrl: string;
  fileName: string;
  fileSize: number; // in bytes
  fileType: string; // MIME type
  uploadedAt: Date;
  updatedAt: Date;
  expiryDate?: Date;
  uploadedBy: string;
  version: string;
  tags: string[];
  requiredRoles: string[];
  isRequired: boolean;
  downloadCount: number;
  previewAvailable: boolean;
}

export interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  documentCount: number;
  requiredRoles?: string[];
}

export interface DocumentFilters {
  category: string;
  searchTerm: string;
  fileType: string;
  dateRange: {
    from?: Date;
    to?: Date;
  };
  showExpired: boolean;
  showRequired: boolean;
}

export interface DocumentStats {
  totalDocuments: number;
  requiredDocuments: number;
  expiringSoon: number;
  expired: number;
  categoriesCount: number;
  totalSize: number;
}
