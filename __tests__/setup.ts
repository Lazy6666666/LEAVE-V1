// @ts-nocheck - Suppressing type checking for test file to focus on core application TypeScript errors
import "@testing-library/jest-dom";
import { vi, beforeAll, afterAll } from "vitest";

// Mock console methods to reduce noise in tests
const originalError = console.error;
const originalLog = console.log;

beforeAll(() => {
  console.error = vi.fn();
  console.log = vi.fn();
});

afterAll(() => {
  console.error = originalError;
  console.log = originalLog;
});

// Enhanced Prisma mock with all required methods
export const mockPrisma = {
  // User related operations
  user: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  profile: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
  },
  // Leave related operations
  leave: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  leaveType: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
  },
  leaveBalance: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
  },
  // Notification related operations
  notificationLog: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  // Document related operations
  companyDocument: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  // Database operations
  $connect: vi.fn(),
  $disconnect: vi.fn(),
  $transaction: vi.fn(),
  $executeRaw: vi.fn(),
  $queryRaw: vi.fn(),
};

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

// Enhanced Supabase client mock
export const createMockSupabase = () => {
  const channel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn((callback) => {
      callback("SUBSCRIBED");
      return { unsubscribe: vi.fn() };
    }),
  };

  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          data: [],
          error: null,
        })),
        in: vi.fn(() => ({ data: [], error: null })),
        like: vi.fn(() => ({ data: [], error: null })),
        limit: vi.fn(() => ({ data: [], error: null })),
        order: vi.fn(() => ({ data: [], error: null })),
        data: [],
        error: null,
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          data: [null],
          error: null,
        })),
        data: [null],
        error: null,
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null,
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null,
        })),
      })),
      upsert: vi.fn(() => ({
        select: vi.fn(() => ({
          data: null,
          error: null,
        })),
        data: null,
        error: null,
      })),
    })),
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: { id: "test-user-id" } }, error: null })
      ),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: { path: "test-path" }, error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: "test-url" } })),
        remove: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      })),
    },
    realtime: {
      channel: vi.fn(() => channel),
    },
    channel: vi.fn(() => channel),
    removeChannel: vi.fn(),
  };
};

vi.mock("@/lib/supabase/client", () => ({
  createClient: createMockSupabase,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createMockSupabase,
}));

// Export a mock instance for direct use in tests
export const mockSupabase = createMockSupabase();

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// Enhanced fetch mock with proper reset capabilities
export const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
});

// React Query mock
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
    prefetchQuery: vi.fn(),
    cancelQueries: vi.fn(),
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    removeQueries: vi.fn(),
  })),
  QueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
    prefetchQuery: vi.fn(),
    cancelQueries: vi.fn(),
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    removeQueries: vi.fn(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
