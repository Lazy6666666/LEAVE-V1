/**
 * Leaves API Integration Tests
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';

// Test configuration
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123',
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseKey);

describe('Leaves API', () => {
  let authHeader: string;
  let testLeaveId: string;

  beforeAll(async () => {
    // Authenticate test user
    const { data: { session }, error } = await supabase.auth.signInWithPassword({
      email: TEST_USER.email,
      password: TEST_USER.password,
    });

    if (error || !session) {
      throw new Error('Failed to authenticate test user');
    }

    authHeader = `Bearer ${session.access_token}`;
  });

  afterAll(async () => {
    // Clean up test data
    if (testLeaveId) {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/leaves/${testLeaveId}`, {
        method: 'DELETE',
        headers: {
          Authorization: authHeader,
        },
      });
    }

    // Sign out test user
    await supabase.auth.signOut();
  });

  describe('GET /api/leaves', () => {
    it('should return user leaves', async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/leaves`, {
        headers: {
          Authorization: authHeader,
        },
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.metadata).toBeDefined();
      expect(data.metadata.requestId).toBeDefined();
      expect(data.metadata.timestamp).toBeDefined();
      expect(data.metadata.duration).toBeGreaterThanOrEqual(0);
    });

    it('should return 401 without authentication', async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/leaves`);

      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should support pagination', async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/leaves?limit=5&offset=0`,
        {
          headers: {
            Authorization: authHeader,
          },
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.metadata.pagination).toBeDefined();
      expect(data.metadata.pagination.limit).toBe(5);
      expect(data.metadata.pagination.page).toBe(1);
    });

    it('should filter by status', async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/leaves?status=PENDING`,
        {
          headers: {
            Authorization: authHeader,
          },
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.every((leave: any) => leave.status === 'PENDING')).toBe(true);
    });
  });

  describe('POST /api/leaves', () => {
    it('should create a new leave request', async () => {
      const leaveData = {
        leaveTypeId: 'annual-leave',
        startDate: '2024-12-25',
        endDate: '2024-12-26',
        reason: 'Christmas holiday',
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/leaves`, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leaveData),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.userId).toBeDefined();
      expect(data.data.status).toBe('PENDING');
      expect(data.metadata.message).toBe('Leave request created successfully');

      testLeaveId = data.data.id;
    });

    it('should validate required fields', async () => {
      const invalidData = {
        startDate: '2024-12-25',
        // Missing required fields
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/leaves`, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details).toBeDefined();
    });

    it('should check date conflicts', async () => {
      // First create a leave
      const leaveData = {
        leaveTypeId: 'annual-leave',
        startDate: '2024-12-20',
        endDate: '2024-12-22',
        reason: 'Test leave',
      };

      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/leaves`, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leaveData),
      });

      // Try to create conflicting leave
      const conflictingData = {
        leaveTypeId: 'annual-leave',
        startDate: '2024-12-21',
        endDate: '2024-12-23',
        reason: 'Conflicting leave',
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/leaves`, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conflictingData),
      });

      expect(response.status).toBe(409);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('LEAVE_CONFLICT');
    });
  });
});