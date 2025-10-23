// @ts-nocheck - Suppressing type checking for test file to focus on core application TypeScript errors
/**
 * Integration Test Setup - Mock Version
 * T-041: Integration Tests
 * Mock setup for API integration tests when real database is not available
 */

import { beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { vi } from "vitest";

// Mock Supabase client for testing
const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  insert: vi.fn(() => mockSupabase),
  update: vi.fn(() => mockSupabase),
  delete: vi.fn(() => mockSupabase),
  upsert: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  in: vi.fn(() => mockSupabase),
  like: vi.fn(() => mockSupabase),
  limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
  single: vi.fn(() => Promise.resolve({ data: null, error: null })),
  order: vi.fn(() => mockSupabase),
  auth: {
    getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: null, session: null }, error: null })),
    signOut: vi.fn(() => Promise.resolve({ error: null })),
  },
};

// Test user data
export const testUsers = {
  employee: {
    id: "test-employee-id",
    email: "test-employee@example.com",
    name: "Test Employee",
    role: "EMPLOYEE",
  },
  manager: {
    id: "test-manager-id",
    email: "test-manager@example.com",
    name: "Test Manager",
    role: "MANAGER",
  },
  hr: {
    id: "test-hr-id",
    email: "test-hr@example.com",
    name: "Test HR",
    role: "HR",
  },
  admin: {
    id: "test-admin-id",
    email: "test-admin@example.com",
    name: "Test Admin",
    role: "ADMIN",
  },
};

// Helper function to create test auth headers
export function createAuthHeaders(userId: string) {
  return {
    Authorization: `Bearer ${userId}`,
    "Content-Type": "application/json",
    "x-test-user-id": userId,
  };
}

// Helper function to create JWT-like tokens for testing (simplified approach)
export function createTestJWT(userId: string, role: string = 'EMPLOYEE'): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: userId,
    role: role,
    aud: 'authenticated',
    exp: Math.floor(Date.now() / 1000) + 3600,
    app_metadata: { role: role },
    user_metadata: { name: `Test ${role}` }
  })).toString('base64url');

  return `${header}.${payload}.test-signature`;
}

// Enhanced auth header creation with proper JWT
export function createTestAuthHeaders(user: typeof testUsers.employee) {
  const jwtToken = createTestJWT(user.id, user.role);
  return {
    Authorization: `Bearer ${jwtToken}`,
    "Content-Type": "application/json",
    "x-test-user-id": user.id,
    "x-test-user-role": user.role,
  };
}

// Mock test data storage (simulating database)
const mockTestData = {
  profiles: [],
  leaves: [],
  notifications: [],
  documents: [],
  leaveTypes: [],
  leaveBalances: [],
};

// Helper function to clean up test data (mock version)
export async function cleanupTestData() {
  console.log("=== Cleaning up mock test data ===");

  // Clear all mock data
  mockTestData.profiles = [];
  mockTestData.leaves = [];
  mockTestData.notifications = [];
  mockTestData.documents = [];
  mockTestData.leaveTypes = [];
  mockTestData.leaveBalances = [];

  console.log("✓ Successfully cleaned up all mock test data");
}

// Setup test data (mock version)
export async function setupTestData() {
  console.log("=== Setting up mock test data ===");

  try {
    // Create test profiles
    for (const [key, user] of Object.entries(testUsers)) {
      mockTestData.profiles.push({
        user_id: user.id,
        email: user.email,
        full_name: user.name,
        role: user.role,
        updated_at: new Date().toISOString(),
      });
      console.log(`✓ Created mock ${key} profile`);
    }

    // Create test leave types
    mockTestData.leaveTypes = [
      {
        id: "test-annual-leave",
        name: "Annual Leave",
        description: "Annual vacation leave",
        annual_quota: 20,
        requires_approval: true,
        active: true,
      },
      {
        id: "test-sick-leave",
        name: "Sick Leave",
        description: "Sick leave for illness",
        annual_quota: 10,
        requires_approval: true,
        active: true,
      },
    ];
    console.log("✓ Created mock leave types");

    // Initialize leave balances for test users
    for (const user of Object.values(testUsers)) {
      mockTestData.leaveBalances.push({
        user_id: user.id,
        leave_type_id: "test-annual-leave",
        remaining_days: 20,
        total_allocated: 20,
        updated_at: new Date().toISOString(),
      });
      console.log(`✓ Created mock leave balance for ${user.name}`);
    }

    console.log("✓ Successfully set up all mock test data");
  } catch (error) {
    console.error("✗ Error during mock test setup:", error);
    throw error;
  }
}

// Enhanced mock Supabase with realistic responses
function createMockSupabaseClient() {
  return {
    from: vi.fn((table: string) => {
      const tableData = mockTestData[table] || [];

      return {
        select: vi.fn((columns?: string) => ({
          data: tableData,
          error: null,
          eq: vi.fn((column: string, value: any) => ({
            data: tableData.filter(item => item[column] === value),
            error: null,
            single: vi.fn(() => ({
              data: tableData.find(item => item[column] === value) || null,
              error: null,
            })),
            limit: vi.fn((limit: number) => ({
              data: tableData.filter(item => item[column] === value).slice(0, limit),
              error: null,
            })),
          })),
          in: vi.fn((column: string, values: any[]) => ({
            data: tableData.filter(item => values.includes(item[column])),
            error: null,
          })),
          like: vi.fn((column: string, pattern: string) => ({
            data: tableData.filter(item =>
              item[column] && item[column].toString().includes(pattern.replace('%', ''))
            ),
            error: null,
          })),
          limit: vi.fn((limit: number) => ({
            data: tableData.slice(0, limit),
            error: null,
          })),
        })),
        insert: vi.fn((data: any) => ({
          data: Array.isArray(data) ? data : [data],
          error: null,
          select: vi.fn(() => ({
            data: Array.isArray(data) ? data : [data],
            error: null,
          })),
        })),
        upsert: vi.fn((data: any, options?: any) => ({
          data: Array.isArray(data) ? data : [data],
          error: null,
          select: vi.fn(() => ({
            data: Array.isArray(data) ? data : [data],
            error: null,
          })),
        })),
        update: vi.fn((data: any) => ({
          data: [data],
          error: null,
          eq: vi.fn((column: string, value: any) => ({
            data: tableData.map(item =>
              item[column] === value ? { ...item, ...data } : item
            ),
            error: null,
          })),
        })),
        delete: vi.fn(() => ({
          data: [],
          error: null,
          eq: vi.fn((column: string, value: any) => ({
            data: [],
            error: null,
          })),
          in: vi.fn((column: string, values: any[]) => ({
            data: [],
            error: null,
          })),
          like: vi.fn((column: string, pattern: string) => ({
            data: [],
            error: null,
          })),
        })),
      };
    }),
    auth: {
      getUser: vi.fn((jwt?: string) => {
        if (jwt) {
          try {
            // Simple JWT parsing for mock purposes
            const [, payload] = jwt.split('.');
            if (payload) {
              const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
              return Promise.resolve({
                data: {
                  user: {
                    id: decoded.sub,
                    app_metadata: decoded.app_metadata,
                    user_metadata: decoded.user_metadata,
                  }
                },
                error: null,
              });
            }
          } catch (e) {
            // Invalid JWT
          }
        }
        return Promise.resolve({ data: { user: null }, error: { message: 'Invalid token' } });
      }),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
  };
}

export const testSupabase = createMockSupabaseClient();
export const adminSupabase = testSupabase;

// Setup before all tests
beforeAll(async () => {
  console.log("Setting up mock integration test environment...");

  // Clean up any existing test data
  await cleanupTestData();

  // Set up fresh test data
  await setupTestData();

  console.log("✓ Mock integration test environment setup complete");
});

beforeEach(async () => {
  // Reset mock call history before each test
  vi.clearAllMocks();
});

afterAll(async () => {
  console.log("Cleaning up mock integration test environment...");

  await cleanupTestData();

  console.log("✓ Mock integration test environment cleanup complete");
});