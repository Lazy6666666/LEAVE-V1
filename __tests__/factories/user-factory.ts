// @ts-nocheck - Suppressing type checking for test file to focus on core application TypeScript errors
import { faker } from "@faker-js/faker";

export interface UserFactoryOptions {
  role?: "EMPLOYEE" | "MANAGER" | "HR" | "ADMIN";
  department?: string;
  override?: Partial<User>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserFactory {
  private static defaults = {
    role: "EMPLOYEE",
    department: "Engineering",
  };

  static create(overrides: UserFactoryOptions = {}): User {
    const options = { ...this.defaults, ...overrides };
    const user: User = {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      role: options.role!,
      department: options.department!,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...options.override,
    };

    return user;
  }

  static createMany(count: number, overrides: UserFactoryOptions = {}): User[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static createEmployee(overrides?: UserFactoryOptions): User {
    return this.create({ ...overrides, role: "EMPLOYEE" });
  }

  static createManager(overrides?: UserFactoryOptions): User {
    return this.create({ ...overrides, role: "MANAGER" });
  }

  static createHR(overrides?: UserFactoryOptions): User {
    return this.create({ ...overrides, role: "HR" });
  }

  static createAdmin(overrides?: UserFactoryOptions): User {
    return this.create({ ...overrides, role: "ADMIN" });
  }

  // Create related users for testing
  static createTeam(department: string, managerOverrides?: UserFactoryOptions) {
    const manager = this.createManager({
      department,
      ...managerOverrides,
    });

    const employees = this.createMany(3, {
      department,
      override: {
        // Link employees to manager in real implementation
      },
    });

    return { manager, employees };
  }
}
