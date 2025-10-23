// @ts-nocheck - Suppressing type checking for test file to focus on core application TypeScript errors
/**
 * Utils Utility Tests
 * Testing core utility functions from lib/utils.ts
 */

import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility function", () => {
  it("should merge class names correctly", () => {
    expect(cn("btn", "btn-primary")).toBe("btn btn-primary");
  });

  it("should handle conditional classes", () => {
    expect(cn("btn", false && "hidden", "active")).toBe("btn active");
  });

  it("should handle undefined and null values", () => {
    expect(cn("btn", undefined, null, "primary")).toBe("btn primary");
  });

  it("should handle empty strings", () => {
    expect(cn("btn", "", "primary")).toBe("btn primary");
  });

  it("should handle arrays of classes", () => {
    expect(cn(["btn", "btn-primary"], ["text-sm"])).toBe(
      "btn btn-primary text-sm"
    );
  });

  it("should handle objects with boolean values", () => {
    expect(
      cn({
        btn: true,
        "btn-primary": true,
        hidden: false,
        active: true,
      })
    ).toBe("btn btn-primary active");
  });

  it("should handle mixed input types", () => {
    expect(
      cn(
        "btn",
        ["btn-primary", "text-sm"],
        { hidden: false, active: true },
        null,
        undefined
      )
    ).toBe("btn btn-primary text-sm active");
  });

  it("should handle Tailwind class conflicts correctly", () => {
    // twMerge should handle conflicting Tailwind classes
    expect(cn("p-4", "p-2")).toBe("p-2");
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  it("should handle complex Tailwind class merging", () => {
    const result1 = cn("px-4 py-2", "px-6");
    expect(result1).toContain("px-6");
    expect(result1).toContain("py-2");

    const result2 = cn("rounded border", "rounded-lg border-2");
    expect(result2).toContain("rounded-lg");
    expect(result2).toContain("border-2");
  });

  it("should return empty string for no inputs", () => {
    expect(cn()).toBe("");
  });

  it("should return empty string for all falsy inputs", () => {
    expect(cn(false, null, undefined, "")).toBe("");
  });
});
