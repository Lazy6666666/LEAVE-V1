// @ts-nocheck - Suppressing type checking for test file to focus on core application TypeScript errors
/**
 * Simple Leave Balance Service Tests
 * T-040: Unit Test Suite Setup
 * Testing core functions that don't require complex mocking
 */

import { calculateWorkingDays } from "@/lib/services/leave-balance";

describe("calculateWorkingDays", () => {
  it("should calculate working days for a single week", () => {
    const startDate = new Date("2024-01-15"); // Monday
    const endDate = new Date("2024-01-19"); // Friday

    const result = calculateWorkingDays(startDate, endDate);

    expect(result).toBe(5);
  });

  it("should exclude weekends", () => {
    const startDate = new Date("2024-01-15"); // Monday
    const endDate = new Date("2024-01-21"); // Sunday

    const result = calculateWorkingDays(startDate, endDate);

    expect(result).toBe(5); // Monday to Friday only
  });

  it("should handle multiple weeks", () => {
    const startDate = new Date("2024-01-15"); // Monday
    const endDate = new Date("2024-01-26"); // Friday

    const result = calculateWorkingDays(startDate, endDate);

    expect(result).toBe(10); // 2 full weeks of working days
  });

  it("should handle partial weeks", () => {
    const startDate = new Date("2024-01-17"); // Wednesday
    const endDate = new Date("2024-01-24"); // Wednesday

    const result = calculateWorkingDays(startDate, endDate);

    expect(result).toBe(6); // Wed-Fri (3 days) + Mon-Wed (3 days)
  });

  it("should handle single day", () => {
    const startDate = new Date("2024-01-17"); // Wednesday
    const endDate = new Date("2024-01-17"); // Wednesday

    const result = calculateWorkingDays(startDate, endDate);

    expect(result).toBe(1);
  });

  it("should return 0 for weekend day", () => {
    const startDate = new Date("2024-01-20"); // Saturday
    const endDate = new Date("2024-01-20"); // Saturday

    const result = calculateWorkingDays(startDate, endDate);

    expect(result).toBe(0);
  });

  it("should handle same date range", () => {
    const startDate = new Date("2024-01-18"); // Thursday
    const endDate = new Date("2024-01-18"); // Thursday

    const result = calculateWorkingDays(startDate, endDate);

    expect(result).toBe(1);
  });

  it("should handle invalid date ranges (end before start)", () => {
    const startDate = new Date("2024-01-20"); // Saturday
    const endDate = new Date("2024-01-15"); // Monday

    const result = calculateWorkingDays(startDate, endDate);

    expect(result).toBe(0);
  });

  it("should handle edge cases around weekends", () => {
    // Friday to Monday
    const startDate = new Date("2024-01-19"); // Friday
    const endDate = new Date("2024-01-22"); // Monday

    const result = calculateWorkingDays(startDate, endDate);

    expect(result).toBe(2); // Friday + Monday
  });

  it("should handle cross-month periods", () => {
    const startDate = new Date("2024-01-29"); // Monday
    const endDate = new Date("2024-02-02"); // Friday

    const result = calculateWorkingDays(startDate, endDate);

    expect(result).toBe(5); // 5 working days across months
  });
});
