"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useKeyboardDetection } from "./focustrap";

/**
 * Global keyboard shortcuts manager
 */
interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  enabled?: boolean;
}

export function useKeyboardShortcuts() {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);

  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts((prev) => [...prev, shortcut]);
    return () => {
      setShortcuts((prev) => prev.filter((s) => s !== shortcut));
    };
  }, []);

  const unregisterShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts((prev) => prev.filter((s) => s !== shortcut));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if user is typing in an input
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true"
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue;

        const matchesKey = event.key === shortcut.key;
        const matchesCtrl = !!shortcut.ctrlKey === event.ctrlKey;
        const matchesAlt = !!shortcut.altKey === event.altKey;
        const matchesShift = !!shortcut.shiftKey === event.shiftKey;
        const matchesMeta = !!shortcut.metaKey === event.metaKey;

        if (
          matchesKey &&
          matchesCtrl &&
          matchesAlt &&
          matchesShift &&
          matchesMeta
        ) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);

  return { registerShortcut, unregisterShortcut, shortcuts };
}

/**
 * Command palette component
 */
export function CommandPalette({
  isOpen,
  onClose,
  commands,
}: {
  isOpen: boolean;
  onClose: () => void;
  commands: Array<{
    id: string;
    name: string;
    shortcut?: string;
    action: () => void;
    icon?: React.ReactNode;
  }>;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const isUsingKeyboard = useKeyboardDetection();

  const filteredCommands = commands.filter((command) =>
    command.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) =>
            Math.min(prev + 1, filteredCommands.length - 1)
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          event.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onClose();
          }
          break;
        case "Escape":
          event.preventDefault();
          onClose();
          break;
      }
    },
    [filteredCommands, selectedIndex, onClose]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-[20vh] z-50">
      <div className="bg-background border rounded-lg shadow-lg w-full max-w-2xl mx-4">
        <div className="p-4 border-b">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-2 bg-muted rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No commands found
            </div>
          ) : (
            <ul className="py-2">
              {filteredCommands.map((command, index) => (
                <li key={command.id}>
                  <button
                    className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-accent transition-colors ${
                      index === selectedIndex ? "bg-accent" : ""
                    }`}
                    onClick={() => {
                      command.action();
                      onClose();
                    }}
                    onMouseEnter={() =>
                      isUsingKeyboard || setSelectedIndex(index)
                    }
                  >
                    {command.icon && (
                      <span className="w-5 h-5 text-muted-foreground">
                        {command.icon}
                      </span>
                    )}
                    <span className="flex-1 text-left">{command.name}</span>
                    {command.shortcut && (
                      <kbd className="px-2 py-1 text-xs bg-muted rounded">
                        {command.shortcut}
                      </kbd>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Menu navigation hook
 */
export function useMenuNavigation(
  items: Array<{ id: string; disabled?: boolean }>,
  onSelect?: (id: string) => void,
  options?: {
    loop?: boolean;
    orientation?: "vertical" | "horizontal";
  }
) {
  const { loop = true, orientation = "vertical" } = options || {};
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const isVertical = orientation === "vertical";
      const nextKey = isVertical ? "ArrowDown" : "ArrowRight";
      const prevKey = isVertical ? "ArrowUp" : "ArrowLeft";

      switch (event.key) {
        case nextKey:
          event.preventDefault();
          setSelectedIndex((prev) => {
            let next = prev + 1;
            if (next >= items.length) {
              next = loop ? 0 : items.length - 1;
            }
            // Skip disabled items
            while (items[next]?.disabled && next !== prev) {
              next = next + 1;
              if (next >= items.length) {
                next = loop ? 0 : items.length - 1;
              }
            }
            return next;
          });
          break;

        case prevKey:
          event.preventDefault();
          setSelectedIndex((prev) => {
            let prevIndex = prev - 1;
            if (prevIndex < 0) {
              prevIndex = loop ? items.length - 1 : 0;
            }
            // Skip disabled items
            while (items[prevIndex]?.disabled && prevIndex !== prev) {
              prevIndex = prevIndex - 1;
              if (prevIndex < 0) {
                prevIndex = loop ? items.length - 1 : 0;
              }
            }
            return prevIndex;
          });
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
          if (
            selectedIndex >= 0 &&
            !items[selectedIndex]?.disabled &&
            onSelect
          ) {
            onSelect(items[selectedIndex].id);
          }
          break;

        case "Escape":
          event.preventDefault();
          setSelectedIndex(-1);
          break;
      }
    },
    [items, selectedIndex, loop, orientation, onSelect]
  );

  const reset = useCallback(() => {
    setSelectedIndex(-1);
  }, []);

  return {
    selectedIndex,
    setSelectedIndex,
    handleKeyDown,
    reset,
  };
}

/**
 * Breadcrumbs navigation with keyboard support
 */
export function Breadcrumbs({
  items,
  separator = "/",
}: {
  items: Array<{
    label: string;
    href?: string;
    current?: boolean;
  }>;
  separator?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" role="navigation">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-muted-foreground" aria-hidden="true">
                {separator}
              </span>
            )}
            {item.href && !item.current ? (
              <a
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-2 py-1"
              >
                {item.label}
              </a>
            ) : (
              <span
                className={
                  item.current
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                }
                aria-current={item.current ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Keyboard shortcuts help modal
 */
export function KeyboardShortcutsHelp({
  isOpen,
  onClose,
  shortcuts,
}: {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: Array<{
    keys: string[];
    description: string;
  }>;
}) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-background border rounded-lg shadow-lg w-full max-w-2xl mx-4 p-6"
        tabIndex={-1}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onClose();
          }
        }}
      >
        <h2 className="text-2xl font-bold mb-4">Keyboard Shortcuts</h2>
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">
                {shortcut.description}
              </span>
              <div className="flex gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <React.Fragment key={keyIndex}>
                    <kbd className="px-2 py-1 text-xs bg-muted border rounded">
                      {key}
                    </kbd>
                    {keyIndex < shortcut.keys.length - 1 && (
                      <span className="text-muted-foreground mx-1">+</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

/**
 * Global keyboard shortcuts provider
 */
export function KeyboardShortcutsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { registerShortcut } = useKeyboardShortcuts();

  useEffect(() => {
    const cleanupFunctions: Array<() => void> = [];

    // Register global shortcuts
    cleanupFunctions.push(
      registerShortcut({
        key: "/",
        action: () => {
          // Open command palette
          window.dispatchEvent(new CustomEvent("openCommandPalette"));
        },
        description: "Open command palette",
      })
    );

    cleanupFunctions.push(
      registerShortcut({
        key: "?",
        action: () => {
          // Show keyboard shortcuts
          window.dispatchEvent(new CustomEvent("showKeyboardShortcuts"));
        },
        description: "Show keyboard shortcuts",
      })
    );

    cleanupFunctions.push(
      registerShortcut({
        key: "g",
        ctrlKey: true,
        action: () => {
          // Go to dashboard
          window.location.href = "/dashboard";
        },
        description: "Go to dashboard",
      })
    );

    cleanupFunctions.push(
      registerShortcut({
        key: "n",
        ctrlKey: true,
        action: () => {
          // New leave request
          window.location.href = "/employee/leaves/new";
        },
        description: "New leave request",
      })
    );

    cleanupFunctions.push(
      registerShortcut({
        key: "c",
        ctrlKey: true,
        action: () => {
          // Open calendar
          window.location.href = "/dashboard/calendar";
        },
        description: "Open calendar",
      })
    );

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [registerShortcut]);

  return <>{children}</>;
}
