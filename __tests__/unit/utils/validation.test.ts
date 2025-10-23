// @ts-nocheck - Suppressing type checking for test file to focus on core application TypeScript errors
/**
 * Validation Utility Tests
 * T-040: Unit Test Suite Setup
 * Testing validation functions from the validation schemas
 */

// Import validation schemas
import { leaveRequestSchema } from "@/lib/validations/leave";
import { documentSchema } from "@/lib/validations/document";

describe("Leave Request Validation", () => {
  it("should validate correct leave request data", () => {
    const validData = {
      leave_type_id: "annual-leave-123",
      start_date: "2024-06-15",
      end_date: "2024-06-17",
      reason: "Family vacation",
      attachment_url: null,
    };

    const result = leaveRequestSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.leave_type_id).toBe("annual-leave-123");
      expect(result.data.reason).toBe("Family vacation");
    }
  });

  it("should reject invalid leave type ID", () => {
    const invalidData = {
      leave_type_id: "",
      start_date: "2024-06-15",
      end_date: "2024-06-17",
      reason: "Family vacation",
      attachment_url: null,
    };

    const result = leaveRequestSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toHaveLength(1);
      expect(result.error.issues[0].path).toContain("leave_type_id");
    }
  });

  it("should reject invalid date format", () => {
    const invalidData = {
      leave_type_id: "annual-leave-123",
      start_date: "2024/06/15", // Wrong format
      end_date: "2024-06-17",
      reason: "Family vacation",
      attachment_url: null,
    };

    const result = leaveRequestSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
  });

  it("should reject end date before start date", () => {
    const invalidData = {
      leave_type_id: "annual-leave-123",
      start_date: "2024-06-17",
      end_date: "2024-06-15", // End before start
      reason: "Family vacation",
      attachment_url: null,
    };

    const result = leaveRequestSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
  });

  it("should reject leave request without reason", () => {
    const invalidData = {
      leave_type_id: "annual-leave-123",
      start_date: "2024-06-15",
      end_date: "2024-06-17",
      reason: "", // Empty reason
      attachment_url: null,
    };

    const result = leaveRequestSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("reason");
    }
  });

  it("should accept leave request with attachment URL", () => {
    const validData = {
      leave_type_id: "annual-leave-123",
      start_date: "2024-06-15",
      end_date: "2024-06-17",
      reason: "Medical appointment",
      attachment_url: "https://example.com/medical-certificate.pdf",
    };

    const result = leaveRequestSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.attachment_url).toBe(
        "https://example.com/medical-certificate.pdf"
      );
    }
  });
});

describe("Document Validation", () => {
  it("should validate correct document data", () => {
    const validData = {
      title: "Employee Handbook 2024",
      description: "Updated employee policies and procedures",
      file_url: "https://example.com/handbook.pdf",
      access_level: "PUBLIC",
      category: "POLICY",
      expires_at: "2025-12-31",
    };

    const result = documentSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Employee Handbook 2024");
      expect(result.data.access_level).toBe("PUBLIC");
    }
  });

  it("should reject empty title", () => {
    const invalidData = {
      title: "",
      description: "Description",
      file_url: "https://example.com/file.pdf",
      access_level: "PUBLIC",
      category: "POLICY",
      expires_at: "2025-12-31",
    };

    const result = documentSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("title");
    }
  });

  it("should reject invalid access level", () => {
    const invalidData = {
      title: "Test Document",
      description: "Description",
      file_url: "https://example.com/file.pdf",
      access_level: "INVALID_LEVEL",
      category: "POLICY",
      expires_at: "2025-12-31",
    };

    const result = documentSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
  });

  it("should reject invalid file URL", () => {
    const invalidData = {
      title: "Test Document",
      description: "Description",
      file_url: "not-a-valid-url",
      access_level: "PUBLIC",
      category: "POLICY",
      expires_at: "2025-12-31",
    };

    const result = documentSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("file_url");
    }
  });

  it("should accept document without expiry date", () => {
    const validData = {
      title: "Permanent Policy",
      description: "Company policy without expiration",
      file_url: "https://example.com/policy.pdf",
      access_level: "HR",
      category: "POLICY",
      expires_at: null,
    };

    const result = documentSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.expires_at).toBeNull();
    }
  });
});

describe("Validation Edge Cases", () => {
  it("should handle very long titles", () => {
    const longTitle = "A".repeat(200); // Very long title

    const invalidData = {
      title: longTitle,
      description: "Description",
      file_url: "https://example.com/file.pdf",
      access_level: "PUBLIC",
      category: "POLICY",
      expires_at: "2025-12-31",
    };

    const result = documentSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
  });

  it("should handle minimum valid dates", () => {
    const validData = {
      leave_type_id: "sick-leave-123",
      start_date: "2024-01-01",
      end_date: "2024-01-01", // Same day leave
      reason: "Feeling unwell",
      attachment_url: null,
    };

    const result = leaveRequestSchema.safeParse(validData);

    expect(result.success).toBe(true);
  });

  it("should handle future dates", () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const futureDateStr = futureDate.toISOString().split("T")[0];

    const validData = {
      leave_type_id: "annual-leave-123",
      start_date: futureDateStr,
      end_date: futureDateStr,
      reason: "Future planning",
      attachment_url: null,
    };

    const result = leaveRequestSchema.safeParse(validData);

    expect(result.success).toBe(true);
  });
});
