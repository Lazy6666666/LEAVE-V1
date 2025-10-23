"use client";

import React, { useRef, useEffect, useCallback } from "react";

/**
 * Focus trap utility for modals and dropdowns
 * Ensures keyboard navigation stays within a component
 */

export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isActive || !containerRef.current) return;

      if (event.key === "Tab") {
        const container = containerRef.current;
        const focusableElements = container.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }

      // Escape key handling
      if (event.key === "Escape") {
        const escapeEvent = new CustomEvent("focusTrapEscape", {
          detail: { container: containerRef.current },
        });
        containerRef.current.dispatchEvent(escapeEvent);
      }
    },
    [isActive]
  );

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;

    // Store the previously focused element
    const previousFocus = document.activeElement as HTMLElement;

    // Focus the first focusable element
    const firstFocusable = container.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    firstFocusable?.focus();

    // Add event listener
    container.addEventListener("keydown", handleKeyDown);

    // Return cleanup function
    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      // Restore focus when trap is deactivated
      previousFocus?.focus();
    };
  }, [isActive, handleKeyDown]);

  return containerRef;
}

/**
 * Focus management hook for managing focus
 */
export function useFocusManagement() {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (
      previousFocusRef.current &&
      typeof previousFocusRef.current.focus === "function"
    ) {
      previousFocusRef.current.focus();
    }
  }, []);

  const focusElement = useCallback(
    (selector: string | HTMLElement, options?: FocusOptions) => {
      const element =
        typeof selector === "string"
          ? (document.querySelector(selector) as HTMLElement)
          : selector;

      if (element && typeof element.focus === "function") {
        element.focus(options);
      }
    },
    []
  );

  const focusFirst = useCallback((container: HTMLElement | string) => {
    const element =
      typeof container === "string"
        ? document.querySelector(container)
        : container;

    const firstFocusable = element?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;

    if (firstFocusable) {
      firstFocusable.focus();
    }
  }, []);

  return {
    saveFocus,
    restoreFocus,
    focusElement,
    focusFirst,
  };
}

/**
 * Skip link component for accessibility
 */
export function SkipLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      {children}
    </a>
  );
}

/**
 * Announce messages to screen readers
 */
export function useAnnouncer() {
  const announcerRef = useRef<HTMLDivElement>(null);

  const announce = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      if (announcerRef.current) {
        announcerRef.current.setAttribute("aria-live", priority);
        announcerRef.current.textContent = message;

        // Clear after announcement
        setTimeout(() => {
          if (announcerRef.current) {
            announcerRef.current.textContent = "";
          }
        }, 1000);
      }
    },
    []
  );

  return {
    announcer: (
      <div
        ref={announcerRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />
    ),
    announce,
  };
}

/**
 * Focus trap component
 */
export function FocusTrap({
  children,
  isActive = true,
  onEscape,
  className,
}: {
  children: React.ReactNode;
  isActive?: boolean;
  onEscape?: () => void;
  className?: string;
}) {
  const ref = useFocusTrap(isActive);

  useEffect(() => {
    if (!ref.current || !onEscape) return;

    const handleEscape = (_event: CustomEvent) => {
      onEscape();
    };

    ref.current.addEventListener(
      "focusTrapEscape",
      handleEscape as EventListener
    );
    return () => {
      ref.current?.removeEventListener(
        "focusTrapEscape",
        handleEscape as EventListener
      );
    };
  }, [isActive, onEscape]);

  return (
    <div ref={ref} className={className} tabIndex={-1}>
      {children}
    </div>
  );
}

/**
 * Manage focus for modal dialogs
 */
export function useModalFocus(isOpen: boolean) {
  const focusTrapRef = useFocusTrap(isOpen);
  const { saveFocus, restoreFocus } = useFocusManagement();

  useEffect(() => {
    if (isOpen) {
      saveFocus();
    } else {
      // Delay restore focus to allow exit animation
      const timeout = setTimeout(restoreFocus, 100);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, saveFocus, restoreFocus]);

  return focusTrapRef;
}

/**
 * Keyboard navigation utilities
 */
export function useKeyboardNavigation(
  items: Array<{ id: string; element?: HTMLElement }>,
  onSelect?: (id: string) => void
) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % items.length);
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
          break;
        case "Home":
          event.preventDefault();
          setSelectedIndex(0);
          break;
        case "End":
          event.preventDefault();
          setSelectedIndex(items.length - 1);
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          if (onSelect && items[selectedIndex]) {
            onSelect(items[selectedIndex].id);
          }
          break;
        case "Escape":
          // Handle escape if needed
          break;
      }
    },
    [items, selectedIndex, onSelect]
  );

  // Focus selected item
  useEffect(() => {
    const item = items[selectedIndex];
    if (item?.element && typeof item.element.focus === "function") {
      item.element.focus();
    }
  }, [selectedIndex, items]);

  return {
    selectedIndex,
    setSelectedIndex,
    handleKeyDown,
  };
}

/**
 * Detect if user is using keyboard navigation
 */
export function useKeyboardDetection() {
  const [isUsingKeyboard, setIsUsingKeyboard] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only certain keys indicate keyboard navigation
      if (
        event.key === "Tab" ||
        event.key === "Enter" ||
        event.key === " " ||
        event.key === "Escape" ||
        event.key.startsWith("Arrow")
      ) {
        setIsUsingKeyboard(true);
      }
    };

    const handleMouseDown = () => {
      setIsUsingKeyboard(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return isUsingKeyboard;
}
