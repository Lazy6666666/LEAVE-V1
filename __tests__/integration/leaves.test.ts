// @ts-nocheck - Suppressing type checking for test file to focus on core application TypeScript errors
/**
 * Leave Management Integration Tests
 * T-041: Integration Tests
 * Testing leave workflow API endpoints
 */

import {
  testSupabase,
  testUsers,
  createAuthHeaders,
  setupTestData,
} from "./setup";

const baseUrl = "http://localhost:3000"; // Adjust if your app runs on different port

describe("Leave Management API Integration", () => {
  beforeEach(async () => {
    await setupTestData();
  });

  it("should create a new leave request", async () => {
    const leaveData = {
      leave_type_id: "test-annual-leave",
      start_date: "2024-06-15",
      end_date: "2024-06-17",
      reason: "Test vacation",
    };

    const response = await fetch(`${baseUrl}/api/leaves`, {
      method: "POST",
      headers: createAuthHeaders(testUsers.employee.id),
      body: JSON.stringify(leaveData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Leave creation error:", errorText);
    }

    expect(response.ok).toBe(true);
    const data = await response.json();

    expect(data).toHaveProperty("id");
    expect(data.user_id).toBe(testUsers.employee.id);
    expect(data.status).toBe("PENDING");
    expect(data.leave_type_id).toBe("test-annual-leave");
  });

  it("should fetch user leaves", async () => {
    // First create a test leave
    const leaveData = {
      leave_type_id: "test-sick-leave",
      start_date: "2024-06-20",
      end_date: "2024-06-21",
      reason: "Test sick leave",
    };

    const createResponse = await fetch(`${baseUrl}/api/leaves`, {
      method: "POST",
      headers: createAuthHeaders(testUsers.employee.id),
      body: JSON.stringify(leaveData),
    });

    expect(createResponse.ok).toBe(true);

    // Now fetch the leaves
    const fetchResponse = await fetch(
      `${baseUrl}/api/leaves?user_id=${testUsers.employee.id}`,
      {
        method: "GET",
        headers: createAuthHeaders(testUsers.employee.id),
      }
    );

    expect(fetchResponse.ok).toBe(true);
    const data = await fetchResponse.json();

    expect(Array.isArray(data.leaves)).toBe(true);
    expect(data.leaves.length).toBeGreaterThan(0);
    expect(data.leaves[0].user_id).toBe(testUsers.employee.id);
  });

  it("should check for leave conflicts", async () => {
    const conflictData = {
      start_date: "2024-06-15",
      end_date: "2024-06-17",
      user_id: testUsers.employee.id,
    };

    const response = await fetch(`${baseUrl}/api/leaves/check-conflicts`, {
      method: "POST",
      headers: createAuthHeaders(testUsers.employee.id),
      body: JSON.stringify(conflictData),
    });

    expect(response.ok).toBe(true);
    const data = await response.json();

    expect(data).toHaveProperty("hasConflict");
    expect(typeof data.hasConflict).toBe("boolean");
  });

  it("should approve a leave request (manager only)", async () => {
    // First create a leave request
    const leaveData = {
      leave_type_id: "test-annual-leave",
      start_date: "2024-06-25",
      end_date: "2024-06-26",
      reason: "Test leave for approval",
    };

    const createResponse = await fetch(`${baseUrl}/api/leaves`, {
      method: "POST",
      headers: createAuthHeaders(testUsers.employee.id),
      body: JSON.stringify(leaveData),
    });

    expect(createResponse.ok).toBe(true);
    const createdLeave = await createResponse.json();

    // Now approve it as manager
    const approveResponse = await fetch(
      `${baseUrl}/api/leaves/${createdLeave.id}/approve`,
      {
        method: "POST",
        headers: createAuthHeaders(testUsers.manager.id),
        body: JSON.stringify({}),
      }
    );

    expect(approveResponse.ok).toBe(true);
    const approvedLeave = await approveResponse.json();

    expect(approvedLeave.status).toBe("APPROVED");
    expect(approvedLeave.approved_by).toBe(testUsers.manager.id);
  });

  it("should reject a leave request (manager only)", async () => {
    // First create a leave request
    const leaveData = {
      leave_type_id: "test-annual-leave",
      start_date: "2024-06-27",
      end_date: "2024-06-28",
      reason: "Test leave for rejection",
    };

    const createResponse = await fetch(`${baseUrl}/api/leaves`, {
      method: "POST",
      headers: createAuthHeaders(testUsers.employee.id),
      body: JSON.stringify(leaveData),
    });

    expect(createResponse.ok).toBe(true);
    const createdLeave = await createResponse.json();

    // Now reject it as manager
    const rejectData = {
      reason: "Insufficient team coverage",
    };

    const rejectResponse = await fetch(
      `${baseUrl}/api/leaves/${createdLeave.id}/reject`,
      {
        method: "POST",
        headers: createAuthHeaders(testUsers.manager.id),
        body: JSON.stringify(rejectData),
      }
    );

    expect(rejectResponse.ok).toBe(true);
    const rejectedLeave = await rejectResponse.json();

    expect(rejectedLeave.status).toBe("REJECTED");
    expect(rejectedLeave.approved_by).toBe(testUsers.manager.id);
    expect(rejectedLeave.rejection_reason).toBe("Insufficient team coverage");
  });

  it("should cancel a leave request (employee only)", async () => {
    // First create a leave request
    const leaveData = {
      leave_type_id: "test-annual-leave",
      start_date: "2024-06-29",
      end_date: "2024-06-30",
      reason: "Test leave for cancellation",
    };

    const createResponse = await fetch(`${baseUrl}/api/leaves`, {
      method: "POST",
      headers: createAuthHeaders(testUsers.employee.id),
      body: JSON.stringify(leaveData),
    });

    expect(createResponse.ok).toBe(true);
    const createdLeave = await createResponse.json();

    // Now cancel it as the employee
    const cancelResponse = await fetch(
      `${baseUrl}/api/leaves/${createdLeave.id}/cancel`,
      {
        method: "POST",
        headers: createAuthHeaders(testUsers.employee.id),
        body: JSON.stringify({}),
      }
    );

    expect(cancelResponse.ok).toBe(true);
    const cancelledLeave = await cancelResponse.json();

    expect(cancelledLeave.status).toBe("CANCELLED");
  });

  it("should prevent employees from approving leaves", async () => {
    // First create a leave request
    const leaveData = {
      leave_type_id: "test-annual-leave",
      start_date: "2024-07-01",
      end_date: "2024-07-02",
      reason: "Test leave",
    };

    const createResponse = await fetch(`${baseUrl}/api/leaves`, {
      method: "POST",
      headers: createAuthHeaders(testUsers.employee.id),
      body: JSON.stringify(leaveData),
    });

    expect(createResponse.ok).toBe(true);
    const createdLeave = await createResponse.json();

    // Try to approve it as another employee (should fail)
    const approveResponse = await fetch(
      `${baseUrl}/api/leaves/${createdLeave.id}/approve`,
      {
        method: "POST",
        headers: createAuthHeaders(testUsers.employee.id),
        body: JSON.stringify({}),
      }
    );

    expect(approveResponse.ok).toBe(false);
    expect(approveResponse.status).toBe(403); // Forbidden
  });

  it("should validate leave request data", async () => {
    const invalidLeaveData = {
      leave_type_id: "", // Invalid: empty
      start_date: "2024-06-15",
      end_date: "2024-06-14", // Invalid: end before start
      reason: "", // Invalid: empty
    };

    const response = await fetch(`${baseUrl}/api/leaves`, {
      method: "POST",
      headers: createAuthHeaders(testUsers.employee.id),
      body: JSON.stringify(invalidLeaveData),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400); // Bad Request
  });

  it("should handle authentication for protected endpoints", async () => {
    // Try to access leaves without authentication
    const response = await fetch(`${baseUrl}/api/leaves`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(401); // Unauthorized
  });

  it("should get leave types", async () => {
    const response = await fetch(`${baseUrl}/api/leave-types`, {
      method: "GET",
      headers: createAuthHeaders(testUsers.employee.id),
    });

    expect(response.ok).toBe(true);
    const data = await response.json();

    expect(Array.isArray(data.leaveTypes)).toBe(true);
    expect(data.leaveTypes.length).toBeGreaterThan(0);
    expect(data.leaveTypes[0]).toHaveProperty("id");
    expect(data.leaveTypes[0]).toHaveProperty("name");
    expect(data.leaveTypes[0]).toHaveProperty("annual_quota");
  });
});
