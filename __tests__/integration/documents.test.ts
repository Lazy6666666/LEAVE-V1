// @ts-nocheck - Suppressing type checking for test file to focus on core application TypeScript errors
/**
 * Document Management Integration Tests
 * T-041: Integration Tests
 * Testing document API endpoints
 */

import {
  testSupabase,
  testUsers,
  createAuthHeaders,
  setupTestData,
} from "./setup";

const baseUrl = "http://localhost:3000"; // Adjust if your app runs on different port

describe("Document Management API Integration", () => {
  beforeEach(async () => {
    await setupTestData();
  });

  it("should create a new document", async () => {
    const documentData = {
      title: "Test Employee Handbook",
      description: "Test handbook for integration testing",
      file_url: "https://example.com/test-handbook.pdf",
      access_level: "PUBLIC",
      category: "POLICY",
      expires_at: "2025-12-31",
    };

    const response = await fetch(`${baseUrl}/api/documents`, {
      method: "POST",
      headers: createAuthHeaders(testUsers.hr.id), // HR can create documents
      body: JSON.stringify(documentData),
    });

    expect(response.ok).toBe(true);
    const data = await response.json();

    expect(data).toHaveProperty("id");
    expect(data.title).toBe("Test Employee Handbook");
    expect(data.access_level).toBe("PUBLIC");
    expect(data.category).toBe("POLICY");
    expect(data.uploaded_by).toBe(testUsers.hr.id);
  });

  it("should fetch documents with appropriate access control", async () => {
    // Create documents with different access levels
    const documents = [
      {
        title: "Public Document",
        description: "Everyone can see this",
        file_url: "https://example.com/public.pdf",
        access_level: "PUBLIC",
        category: "GENERAL",
        uploader: testUsers.hr.id,
      },
      {
        title: "HR Only Document",
        description: "Only HR and Admin can see this",
        file_url: "https://example.com/hr.pdf",
        access_level: "HR",
        category: "POLICY",
        uploader: testUsers.hr.id,
      },
      {
        title: "Manager Document",
        description: "Manager and above can see this",
        file_url: "https://example.com/manager.pdf",
        access_level: "MANAGER",
        category: "PROCEDURE",
        uploader: testUsers.admin.id,
      },
    ];

    // Create documents as HR
    for (const doc of documents) {
      const response = await fetch(`${baseUrl}/api/documents`, {
        method: "POST",
        headers: createAuthHeaders(testUsers.hr.id),
        body: JSON.stringify(doc),
      });
      expect(response.ok).toBe(true);
    }

    // Test access for different user roles
    const accessTests = [
      {
        user: testUsers.employee,
        expectedMinCount: 1, // Should only see PUBLIC documents
        description: "Employee should see public documents only",
      },
      {
        user: testUsers.manager,
        expectedMinCount: 2, // Should see PUBLIC and MANAGER documents
        description: "Manager should see public and manager documents",
      },
      {
        user: testUsers.hr,
        expectedMinCount: 3, // Should see all documents
        description: "HR should see all documents",
      },
    ];

    for (const test of accessTests) {
      const response = await fetch(`${baseUrl}/api/documents`, {
        method: "GET",
        headers: createAuthHeaders(test.user.id),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();

      expect(Array.isArray(data.documents)).toBe(true);
      expect(data.documents.length).toBeGreaterThanOrEqual(
        test.expectedMinCount
      );
    }
  });

  it("should update document details", async () => {
    // First create a document
    const createData = {
      title: "Original Document Title",
      description: "Original description",
      file_url: "https://example.com/original.pdf",
      access_level: "PUBLIC",
      category: "GENERAL",
    };

    const createResponse = await fetch(`${baseUrl}/api/documents`, {
      method: "POST",
      headers: createAuthHeaders(testUsers.hr.id),
      body: JSON.stringify(createData),
    });

    expect(createResponse.ok).toBe(true);
    const createdDocument = await createResponse.json();

    // Now update it
    const updateData = {
      title: "Updated Document Title",
      description: "Updated description",
      category: "POLICY",
    };

    const updateResponse = await fetch(
      `${baseUrl}/api/documents/${createdDocument.id}`,
      {
        method: "PUT",
        headers: createAuthHeaders(testUsers.hr.id),
        body: JSON.stringify(updateData),
      }
    );

    expect(updateResponse.ok).toBe(true);
    const updatedDocument = await updateResponse.json();

    expect(updatedDocument.title).toBe("Updated Document Title");
    expect(updatedDocument.description).toBe("Updated description");
    expect(updatedDocument.category).toBe("POLICY");
    expect(updatedDocument.file_url).toBe("https://example.com/original.pdf"); // Should remain unchanged
  });

  it("should delete a document", async () => {
    // First create a document
    const createData = {
      title: "Document to Delete",
      description: "This document will be deleted",
      file_url: "https://example.com/delete-me.pdf",
      access_level: "PUBLIC",
      category: "TEMPORARY",
    };

    const createResponse = await fetch(`${baseUrl}/api/documents`, {
      method: "POST",
      headers: createAuthHeaders(testUsers.hr.id),
      body: JSON.stringify(createData),
    });

    expect(createResponse.ok).toBe(true);
    const createdDocument = await createResponse.json();

    // Now delete it
    const deleteResponse = await fetch(
      `${baseUrl}/api/documents/${createdDocument.id}`,
      {
        method: "DELETE",
        headers: createAuthHeaders(testUsers.hr.id),
      }
    );

    expect(deleteResponse.ok).toBe(true);

    // Verify it's deleted
    const fetchResponse = await fetch(`${baseUrl}/api/documents`, {
      method: "GET",
      headers: createAuthHeaders(testUsers.hr.id),
    });

    expect(fetchResponse.ok).toBe(true);
    const data = await fetchResponse.json();

    const deletedDocument = data.documents.find(
      (d: any) => d.id === createdDocument.id
    );
    expect(deletedDocument).toBeUndefined();
  });

  it("should get document by ID", async () => {
    // Create a document
    const createData = {
      title: "Specific Document",
      description: "Document for ID lookup test",
      file_url: "https://example.com/specific.pdf",
      access_level: "HR",
      category: "CONFIDENTIAL",
    };

    const createResponse = await fetch(`${baseUrl}/api/documents`, {
      method: "POST",
      headers: createAuthHeaders(testUsers.hr.id),
      body: JSON.stringify(createData),
    });

    expect(createResponse.ok).toBe(true);
    const createdDocument = await createResponse.json();

    // Get it by ID
    const getResponse = await fetch(
      `${baseUrl}/api/documents/${createdDocument.id}`,
      {
        method: "GET",
        headers: createAuthHeaders(testUsers.hr.id),
      }
    );

    expect(getResponse.ok).toBe(true);
    const document = await getResponse.json();

    expect(document.id).toBe(createdDocument.id);
    expect(document.title).toBe("Specific Document");
    expect(document.access_level).toBe("HR");
  });

  it("should handle document expiry", async () => {
    // Create a document that expires soon
    const createData = {
      title: "Expiring Document",
      description: "Document that will expire soon",
      file_url: "https://example.com/expiring.pdf",
      access_level: "PUBLIC",
      category: "TEMPORARY",
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // Tomorrow
    };

    const createResponse = await fetch(`${baseUrl}/api/documents`, {
      method: "POST",
      headers: createAuthHeaders(testUsers.hr.id),
      body: JSON.stringify(createData),
    });

    expect(createResponse.ok).toBe(true);

    // Check for expiring documents
    const expiryResponse = await fetch(
      `${baseUrl}/api/documents/expiry?days=7`,
      {
        method: "GET",
        headers: createAuthHeaders(testUsers.admin.id), // Admin can check expiry
      }
    );

    expect(expiryResponse.ok).toBe(true);
    const data = await expiryResponse.json();

    expect(Array.isArray(data.expiringDocuments)).toBe(true);
    expect(data.expiringDocuments.length).toBeGreaterThan(0);
  });

  it("should enforce access control on document creation", async () => {
    const documentData = {
      title: "Unauthorized Document",
      description: "Employee trying to create document",
      file_url: "https://example.com/unauthorized.pdf",
      access_level: "PUBLIC",
      category: "GENERAL",
    };

    // Employee trying to create document (should fail)
    const response = await fetch(`${baseUrl}/api/documents`, {
      method: "POST",
      headers: createAuthHeaders(testUsers.employee.id),
      body: JSON.stringify(documentData),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(403); // Forbidden
  });

  it("should validate document data", async () => {
    const invalidDocumentData = {
      title: "", // Invalid: empty
      description: "Valid description",
      file_url: "not-a-valid-url", // Invalid: not a proper URL
      access_level: "INVALID_LEVEL", // Invalid: not a valid access level
      category: "INVALID_CATEGORY", // Invalid: not a valid category
    };

    const response = await fetch(`${baseUrl}/api/documents`, {
      method: "POST",
      headers: createAuthHeaders(testUsers.hr.id),
      body: JSON.stringify(invalidDocumentData),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400); // Bad Request
  });

  it("should handle non-existent document gracefully", async () => {
    const fakeId = "non-existent-document-id";

    const response = await fetch(`${baseUrl}/api/documents/${fakeId}`, {
      method: "GET",
      headers: createAuthHeaders(testUsers.hr.id),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(404); // Not Found
  });

  it("should prevent unauthorized document access", async () => {
    // Create an HR-only document
    const createData = {
      title: "Confidential HR Document",
      description: "Only HR and Admin should see this",
      file_url: "https://example.com/confidential.pdf",
      access_level: "HR",
      category: "CONFIDENTIAL",
    };

    const createResponse = await fetch(`${baseUrl}/api/documents`, {
      method: "POST",
      headers: createAuthHeaders(testUsers.hr.id),
      body: JSON.stringify(createData),
    });

    expect(createResponse.ok).toBe(true);
    const createdDocument = await createResponse.json();

    // Try to access it as an employee (should fail)
    const response = await fetch(
      `${baseUrl}/api/documents/${createdDocument.id}`,
      {
        method: "GET",
        headers: createAuthHeaders(testUsers.employee.id),
      }
    );

    expect(response.ok).toBe(false);
    expect(response.status).toBe(403); // Forbidden
  });

  it("should handle authentication for document endpoints", async () => {
    // Try to access documents without authentication
    const response = await fetch(`${baseUrl}/api/documents`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(401); // Unauthorized
  });
});
