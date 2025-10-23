// @ts-nocheck - Suppressing type checking for test file to focus on core application TypeScript errors
/**
 * Test Data Factory
 * Provides factory methods for generating test data for different scenarios
 */

export interface UserCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "employee" | "manager" | "hr" | "admin";
}

export interface LeaveRequestData {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  halfDay?: "morning" | "afternoon";
}

export interface DocumentData {
  title: string;
  description: string;
  category: string;
  expiryDate?: string;
}

export interface SearchData {
  query: string;
  filters: Record<string, any>;
  expectedResults: number;
}

/**
 * Factory for creating user credentials
 */
export class UserFactory {
  /**
   * Create valid employee credentials
   */
  static createEmployee(override?: Partial<UserCredentials>): UserCredentials {
    return {
      email: `employee${Date.now()}@example.com`,
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      role: "employee",
      ...override,
    };
  }

  /**
   * Create valid manager credentials
   */
  static createManager(override?: Partial<UserCredentials>): UserCredentials {
    return {
      email: `manager${Date.now()}@example.com`,
      password: "password123",
      firstName: "Jane",
      lastName: "Smith",
      role: "manager",
      ...override,
    };
  }

  /**
   * Create valid HR credentials
   */
  static createHR(override?: Partial<UserCredentials>): UserCredentials {
    return {
      email: `hr${Date.now()}@example.com`,
      password: "password123",
      firstName: "Alice",
      lastName: "Johnson",
      role: "hr",
      ...override,
    };
  }

  /**
   * Create valid admin credentials
   */
  static createAdmin(override?: Partial<UserCredentials>): UserCredentials {
    return {
      email: `admin${Date.now()}@example.com`,
      password: "password123",
      firstName: "Bob",
      lastName: "Wilson",
      role: "admin",
      ...override,
    };
  }

  /**
   * Create invalid credentials for negative testing
   */
  static createInvalidCredentials(): UserCredentials {
    return {
      email: "invalid-email",
      password: "123", // Too short
      firstName: "",
      lastName: "",
      role: "employee",
    };
  }

  /**
   * Create predefined test users
   */
  static createTestUsers(): Record<string, UserCredentials> {
    const timestamp = Date.now();
    return {
      employee: {
        email: `test.employee.${timestamp}@example.com`,
        password: "TestPass123!",
        firstName: "Test",
        lastName: "Employee",
        role: "employee",
      },
      manager: {
        email: `test.manager.${timestamp}@example.com`,
        password: "TestPass123!",
        firstName: "Test",
        lastName: "Manager",
        role: "manager",
      },
      hr: {
        email: `test.hr.${timestamp}@example.com`,
        password: "TestPass123!",
        firstName: "Test",
        lastName: "HR",
        role: "hr",
      },
      admin: {
        email: `test.admin.${timestamp}@example.com`,
        password: "TestPass123!",
        firstName: "Test",
        lastName: "Admin",
        role: "admin",
      },
    };
  }
}

/**
 * Factory for creating leave request data
 */
export class LeaveRequestFactory {
  /**
   * Create standard leave request
   */
  static createStandardLeave(
    override?: Partial<LeaveRequestData>
  ): LeaveRequestData {
    const today = new Date();
    const startDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // Next week
    const endDate = new Date(today.getTime() + 9 * 24 * 60 * 60 * 1000); // 3 days later

    return {
      leaveType: "Annual Leave",
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      reason: "Personal vacation time to relax and recharge",
      ...override,
    };
  }

  /**
   * Create sick leave request
   */
  static createSickLeave(
    override?: Partial<LeaveRequestData>
  ): LeaveRequestData {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    return {
      leaveType: "Sick Leave",
      startDate: yesterday.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
      reason: "Feeling unwell and need to recover",
      ...override,
    };
  }

  /**
   * Create half-day leave request
   */
  static createHalfDayLeave(
    override?: Partial<LeaveRequestData>
  ): LeaveRequestData {
    const today = new Date();

    return {
      leaveType: "Personal Leave",
      startDate: today.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
      reason: "Doctor appointment in the afternoon",
      halfDay: "afternoon",
      ...override,
    };
  }

  /**
   * Create emergency leave request
   */
  static createEmergencyLeave(
    override?: Partial<LeaveRequestData>
  ): LeaveRequestData {
    const today = new Date();

    return {
      leaveType: "Emergency Leave",
      startDate: today.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
      reason: "Family emergency - need to attend immediately",
      ...override,
    };
  }

  /**
   * Create long duration leave request
   */
  static createLongLeave(
    override?: Partial<LeaveRequestData>
  ): LeaveRequestData {
    const today = new Date();
    const startDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // Next month
    const endDate = new Date(today.getTime() + 44 * 24 * 60 * 60 * 1000); // 2 weeks

    return {
      leaveType: "Annual Leave",
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      reason: "Extended family vacation and travel",
      ...override,
    };
  }

  /**
   * Create invalid leave request for negative testing
   */
  static createInvalidLeave(): LeaveRequestData {
    const yesterday = new Date();
    const today = new Date();

    return {
      leaveType: "",
      startDate: yesterday.toISOString().split("T")[0], // Past date
      endDate: today.toISOString().split("T")[0],
      reason: "", // Empty reason
    };
  }

  /**
   * Create leave request with conflicting dates
   */
  static createConflictingLeave(): LeaveRequestData {
    const today = new Date();
    const startDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    const endDate = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);

    return {
      leaveType: "Annual Leave",
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      reason: "Overlapping vacation time",
    };
  }
}

/**
 * Factory for creating document data
 */
export class DocumentFactory {
  /**
   * Create standard document
   */
  static createStandardDocument(
    override?: Partial<DocumentData>
  ): DocumentData {
    return {
      title: "Employment Contract",
      description: "Signed employment agreement with terms and conditions",
      category: "Contract",
      expiryDate: "2025-12-31",
      ...override,
    };
  }

  /**
   * Create certificate document
   */
  static createCertificateDocument(
    override?: Partial<DocumentData>
  ): DocumentData {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 2);

    return {
      title: "First Aid Certificate",
      description: "Valid first aid and CPR certification",
      category: "Certificate",
      expiryDate: futureDate.toISOString().split("T")[0],
      ...override,
    };
  }

  /**
   * Create policy document
   */
  static createPolicyDocument(override?: Partial<DocumentData>): DocumentData {
    return {
      title: "Employee Handbook 2024",
      description: "Complete employee policies and procedures manual",
      category: "Policy",
      ...override,
    };
  }

  /**
   * Create training document
   */
  static createTrainingDocument(
    override?: Partial<DocumentData>
  ): DocumentData {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    return {
      title: "Safety Training Completion",
      description: "Workplace safety training certificate of completion",
      category: "Training",
      expiryDate: futureDate.toISOString().split("T")[0],
      ...override,
    };
  }

  /**
   * Create expired document for testing
   */
  static createExpiredDocument(): DocumentData {
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);

    return {
      title: "Expired Certification",
      description: "This certification has expired and needs renewal",
      category: "Certificate",
      expiryDate: pastDate.toISOString().split("T")[0],
    };
  }
}

/**
 * Factory for creating search test data
 */
export class SearchFactory {
  /**
   * Create search test for leave requests
   */
  static createLeaveSearch(): SearchData {
    return {
      query: "vacation",
      filters: {
        status: "pending",
        type: "Annual Leave",
      },
      expectedResults: 5,
    };
  }

  /**
   * Create search test for documents
   */
  static createDocumentSearch(): SearchData {
    return {
      query: "contract",
      filters: {
        category: "Contract",
        status: "active",
      },
      expectedResults: 3,
    };
  }

  /**
   * Create search test for users
   */
  static createUserSearch(): SearchData {
    return {
      query: "john",
      filters: {
        role: "employee",
        department: "engineering",
      },
      expectedResults: 2,
    };
  }

  /**
   * Create search test with no results
   */
  static createNoResultsSearch(): SearchData {
    return {
      query: "xyznonexistentterm",
      filters: {},
      expectedResults: 0,
    };
  }
}

/**
 * Factory for creating test scenarios
 */
export class TestScenarioFactory {
  /**
   * Create complete onboarding scenario
   */
  static createOnboardingScenario() {
    return {
      user: UserFactory.createEmployee(),
      documents: [
        DocumentFactory.createStandardDocument(),
        DocumentFactory.createCertificateDocument(),
      ],
      leaveRequests: [LeaveRequestFactory.createStandardLeave()],
    };
  }

  /**
   * Create manager workflow scenario
   */
  static createManagerScenario() {
    return {
      manager: UserFactory.createManager(),
      employees: [
        UserFactory.createEmployee({ firstName: "Alice", lastName: "Brown" }),
        UserFactory.createEmployee({ firstName: "Charlie", lastName: "Davis" }),
      ],
      pendingLeaves: [
        LeaveRequestFactory.createStandardLeave({ reason: "Family vacation" }),
        LeaveRequestFactory.createSickLeave(),
      ],
    };
  }

  /**
   * Create conflict resolution scenario
   */
  static createConflictScenario() {
    const dates = {
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    };

    return {
      employees: [
        UserFactory.createEmployee({ firstName: "Alice", lastName: "Brown" }),
        UserFactory.createEmployee({ firstName: "Bob", lastName: "Green" }),
      ],
      overlappingLeaves: [
        LeaveRequestFactory.createStandardLeave(dates),
        LeaveRequestFactory.createStandardLeave(dates),
      ],
    };
  }

  /**
   * Create accessibility test scenario
   */
  static createAccessibilityScenario() {
    return {
      user: UserFactory.createEmployee(),
      testScenarios: [
        "keyboard_navigation",
        "screen_reader",
        "color_contrast",
        "focus_management",
        "aria_labels",
      ],
    };
  }
}

/**
 * Constants for test data
 */
export const TEST_CONSTANTS = {
  VALID_PASSWORD: "TestPass123!",
  INVALID_PASSWORD: "123",
  VALID_EMAIL_DOMAIN: "example.com",
  BASE_URL: process.env.BASE_URL || "http://localhost:3000",
  TIMEOUTS: {
    SHORT: 2000,
    MEDIUM: 5000,
    LONG: 10000,
    EXTRA_LONG: 30000,
  },
  DATES: {
    TODAY: new Date().toISOString().split("T")[0],
    TOMORROW: new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    NEXT_WEEK: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    NEXT_MONTH: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  },
  LEAVE_TYPES: [
    "Annual Leave",
    "Sick Leave",
    "Personal Leave",
    "Emergency Leave",
    "Maternity Leave",
    "Paternity Leave",
  ],
  DOCUMENT_CATEGORIES: [
    "Contract",
    "Certificate",
    "Policy",
    "Training",
    "Identification",
    "Other",
  ],
} as const;
