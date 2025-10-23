// @ts-nocheck - Suppressing type checking for unit test to focus on core application TypeScript errors
/**
 * GlobalSearch Component Tests
 * T-040: Unit Test Suite Setup
 * Testing global search functionality with comprehensive coverage
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GlobalSearch } from "@/components/search/GlobalSearch";

// Mock fetch for search API
import { mockFetch } from "../../../setup.js";

describe("GlobalSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render search input correctly", () => {
    render(<GlobalSearch />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute("type", "search");
  });

  it("should show search suggestions on input", async () => {
    const mockSuggestions = [
      {
        type: "leave",
        title: "Annual Leave Request",
        description: "View leave request details",
        url: "/employee/leaves/123",
      },
      {
        type: "document",
        title: "HR Policy Document",
        description: "Company HR policies",
        url: "/documents/456",
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestions: mockSuggestions }),
    });

    render(<GlobalSearch />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, "annual");

    await waitFor(() => {
      expect(screen.getByText("Annual Leave Request")).toBeInTheDocument();
      expect(screen.getByText("HR Policy Document")).toBeInTheDocument();
    });
  });

  it("should handle keyboard navigation", async () => {
    const mockSuggestions = [
      { type: "leave", title: "First Result", url: "/leave/1" },
      { type: "leave", title: "Second Result", url: "/leave/2" },
      { type: "document", title: "Third Result", url: "/doc/3" },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestions: mockSuggestions }),
    });

    render(<GlobalSearch />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, "test");

    await waitFor(() => {
      expect(screen.getByText("First Result")).toBeInTheDocument();
    });

    // Test arrow down navigation
    await userEvent.keyboard("{ArrowDown}");
    const firstItem = screen.getByText("First Result").closest("div");
    expect(firstItem).toHaveClass("focused");

    // Test arrow up navigation
    await userEvent.keyboard("{ArrowUp}");
    expect(firstItem).not.toHaveClass("focused");

    // Test Enter to select
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/search?q=test", expect.any(Object));
    });
  });

  it("should search with debouncing", async () => {
    render(<GlobalSearch />);

    const searchInput = screen.getByPlaceholderText(/search/i);

    // Type rapidly - should only trigger one API call
    await userEvent.type(searchInput, "rapid");
    await userEvent.clear(searchInput);
    await userEvent.type(searchInput, "search");

    // Wait for debounce timeout
    await new Promise(resolve => setTimeout(resolve, 500));

    // Should only call API once due to debouncing
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/search?q=search",
      expect.objectContaining({
        method: "GET",
      })
    );
  });

  it("should show no results message", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestions: [] }),
    });

    render(<GlobalSearch />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, "noresults");

    await waitFor(() => {
      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    });
  });

  it("should handle search errors gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Search failed"));

    render(<GlobalSearch />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, "error");

    await waitFor(() => {
      expect(screen.getByText(/search failed/i)).toBeInTheDocument();
    });
  });

  it("should highlight matching text in suggestions", async () => {
    const mockSuggestions = [
      {
        type: "leave",
        title: "Annual Leave Policy",
        description: "Company annual leave guidelines",
        url: "/documents/annual-leave",
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestions: mockSuggestions }),
    });

    render(<GlobalSearch />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, "annual");

    await waitFor(() => {
      const highlightedTitle = screen.getByText(/Annual/);
      expect(highlightedTitle.closest("mark")).toBeInTheDocument();
    });
  });

  it("should categorize search results", async () => {
    const mockSuggestions = [
      { type: "leave", title: "Leave Request", url: "/leave/1" },
      { type: "document", title: "HR Document", url: "/doc/1" },
      { type: "user", title: "John Doe", url: "/users/1" },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestions: mockSuggestions }),
    });

    render(<GlobalSearch />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, "test");

    await waitFor(() => {
      expect(screen.getByText(/Leave/i)).toBeInTheDocument();
      expect(screen.getByText(/Document/i)).toBeInTheDocument();
      expect(screen.getByText(/User/i)).toBeInTheDocument();
    });

    // Check for category indicators
    expect(screen.getByTitle("Leave Request")).toBeInTheDocument();
    expect(screen.getByTitle("HR Document")).toBeInTheDocument();
    expect(screen.getByTitle("User")).toBeInTheDocument();
  });

  it("should clear search on Escape key", async () => {
    render(<GlobalSearch />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, "test query");

    expect(searchInput).toHaveValue("test query");

    await userEvent.keyboard("{Escape}");

    expect(searchInput).toHaveValue("");
    // Suggestions should disappear
    expect(screen.queryByText(/test query/i)).not.toBeInTheDocument();
  });

  it("should handle recent searches", async () => {
    // Mock localStorage for recent searches
    const recentSearches = ["annual leave", "sick day", "document"];
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => JSON.stringify(recentSearches)),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });

    render(<GlobalSearch />);

    // Focus search input to show recent searches
    const searchInput = screen.getByPlaceholderText(/search/i);
    searchInput.focus();

    await waitFor(() => {
      expect(screen.getByText(/recent searches/i)).toBeInTheDocument();
      expect(screen.getByText("annual leave")).toBeInTheDocument();
      expect(screen.getByText("sick day")).toBeInTheDocument();
      expect(screen.getByText("document")).toBeInTheDocument();
    });
  });

  it("should save search to recent searches", async () => {
    const setItemSpy = vi.fn();
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => '[]'),
        setItem: setItemSpy,
        removeItem: vi.fn(),
      },
      writable: true,
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestions: [] }),
    });

    render(<GlobalSearch />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, "new search");
    await userEvent.keyboard("{Enter}");

    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalledWith(
        "recentSearches",
        expect.stringContaining("new search")
      );
    });
  });

  it("should limit recent searches count", async () => {
    const existingSearches = Array(15).fill(null).map((_, i) => `search ${i}`);
    const setItemSpy = vi.fn();

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => JSON.stringify(existingSearches)),
        setItem: setItemSpy,
        removeItem: vi.fn(),
      },
      writable: true,
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestions: [] }),
    });

    render(<GlobalSearch />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, "new search");
    await userEvent.keyboard("{Enter}");

    await waitFor(() => {
      const savedSearches = JSON.parse(setItemSpy.mock.calls[0][1]);
      expect(savedSearches).toHaveLength(10); // Should limit to 10 recent searches
      expect(savedSearches[0]).toBe("new search"); // New search should be first
    });
  });

  it("should handle special characters in search", async () => {
    const specialChars = "!@#$%^&*()_+-=[]{}|;':\",./<>?";

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestions: [] }),
    });

    render(<GlobalSearch />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, specialChars);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent(specialChars)),
        expect.any(Object)
      );
    });
  });

  it("should be accessible", async () => {
    render(<GlobalSearch />);

    const searchInput = screen.getByPlaceholderText(/search/i);

    // Check accessibility attributes
    expect(searchInput).toHaveAttribute("role", "searchbox");
    expect(searchInput).toHaveAttribute("aria-label", "Global search");
    expect(searchInput).toHaveAttribute("aria-expanded", "false");

    // Test keyboard accessibility
    await userEvent.tab();
    expect(searchInput).toHaveFocus();

    // Type to show suggestions
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestions: [
        { type: "leave", title: "Test Result", url: "/test" }
      ]}),
    });

    await userEvent.type(searchInput, "test");

    await waitFor(() => {
      const suggestion = screen.getByText("Test Result").closest("div");
      expect(suggestion).toHaveAttribute("role", "option");
      expect(suggestion).toHaveAttribute("tabindex", "0");
    });
  });

  it("should handle mobile touch events", async () => {
    // Mock touch events
    const mockTouch = new TouchEvent("touchstart", {
      bubbles: true,
      cancelable: true,
    });

    render(<GlobalSearch />);

    const searchInput = screen.getByPlaceholderText(/search/i);

    // Simulate mobile touch
    fireEvent.touchStart(searchInput);

    // Should open search on touch
    expect(searchInput).toHaveFocus();
  });

  it("should handle rapid search queries", async () => {
    render(<GlobalSearch />);

    const searchInput = screen.getByPlaceholderText(/search/i);

    // Type multiple characters rapidly
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(userEvent.type(searchInput, "a"));
    }

    await Promise.all(promises);

    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 600));

    // Should only make one API call due to debouncing
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should preserve search state on navigation", async () => {
    // Mock location state
    const mockState = { searchQuery: "existing search" };
    Object.defineProperty(window.history, 'state', {
      value: mockState,
      writable: true,
    });

    render(<GlobalSearch />);

    const searchInput = screen.getByPlaceholderText(/search/i);

    // Should restore previous search
    expect(searchInput).toHaveValue("existing search");
  });

  it("should handle empty search query", async () => {
    render(<GlobalSearch />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    await userEvent.clear(searchInput);

    // Should not trigger search for empty query
    expect(mockFetch).not.toHaveBeenCalled();

    // Should clear any existing results
    expect(screen.queryByText(/no results/i)).not.toBeInTheDocument();
  });
});