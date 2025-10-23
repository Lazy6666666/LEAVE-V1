/**
 * Mobile Gesture Components
 * Provides swipeable and touch-optimized components for mobile devices
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAnimation, PanInfo, AnimatePresence, motion } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import { cn } from "@/lib/utils";

// Touch feedback hook
const useTouchFeedback = () => {
  const [isPressed, setIsPressed] = useState(false);

  const handlers = {
    onTouchStart: () => setIsPressed(true),
    onTouchEnd: () => setIsPressed(false),
    onMouseDown: () => setIsPressed(true),
    onMouseUp: () => setIsPressed(false),
    onMouseLeave: () => setIsPressed(false),
  };

  return { isPressed, handlers };
};

// Swipeable List Item
interface SwipeableListItemProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    label: string;
    icon: React.ReactNode;
    color?: string;
    onClick?: () => void;
  };
  rightAction?: {
    label: string;
    icon: React.ReactNode;
    color?: string;
    onClick?: () => void;
  };
  className?: string;
  disabled?: boolean;
}

export const SwipeableListItem = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  className,
  disabled = false,
}: SwipeableListItemProps) => {
  const [dragOffset, setDragOffset] = useState(0);
  const [_isDragging, setIsDragging] = useState(false);
  const controls = useAnimation();

  const handlers = useSwipeable({
    onSwipedLeft: (_e) => {
      if (!disabled) {
        onSwipeLeft?.();
        leftAction?.onClick?.();
      }
    },
    onSwipedRight: () => {
      if (!disabled) {
        onSwipeRight?.();
        rightAction?.onClick?.();
      }
    },
    onSwiping: (e) => {
      if (!disabled) {
        setDragOffset(e.deltaX);
        setIsDragging(true);
      }
    },
    onSwiped: () => {
      setDragOffset(0);
      setIsDragging(false);
    },
        trackMouse: true,
    trackTouch: true,
  });

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;

    if (info.offset.x > threshold && rightAction) {
      controls.start({ x: 0 });
      rightAction.onClick?.();
    } else if (info.offset.x < -threshold && leftAction) {
      controls.start({ x: 0 });
      leftAction.onClick?.();
    } else {
      controls.start({ x: 0 });
    }

    setDragOffset(0);
    setIsDragging(false);
  };

  return (
    <div className={cn("relative overflow-hidden", className)} {...handlers}>
      {/* Left Action Background */}
      {leftAction && (
        <motion.div
          className={cn(
            "absolute inset-y-0 left-0 flex items-center px-4 text-white",
            leftAction.color || "bg-destructive"
          )}
          initial={{ width: 0 }}
          animate={{ width: Math.max(0, dragOffset) }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center gap-2">
            {leftAction.icon}
            <span className="text-sm font-medium">{leftAction.label}</span>
          </div>
        </motion.div>
      )}

      {/* Right Action Background */}
      {rightAction && (
        <motion.div
          className={cn(
            "absolute inset-y-0 right-0 flex items-center px-4 text-white",
            rightAction.color || "bg-success"
          )}
          initial={{ width: 0 }}
          animate={{ width: Math.max(0, -dragOffset) }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{rightAction.label}</span>
            {rightAction.icon}
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <motion.div
        drag={disabled ? false : "x"}
        dragConstraints={{ left: -150, right: 150 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x: dragOffset }}
        className={cn(
          "relative bg-background border touch-manipulation",
          dragOffset > 50 && "border-l-4",
          dragOffset < -50 && "border-r-4"
        )}
      >
        {children}
      </motion.div>
    </div>
  );
};

// Pull to Refresh Component
interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void> | void;
  isRefreshing?: boolean;
  pullDownThreshold?: number;
  className?: string;
}

export const PullToRefresh = ({
  children,
  onRefresh,
  isRefreshing = false,
  pullDownThreshold = 80,
  className,
}: PullToRefreshProps) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startY = 0;
    let currentY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (container.scrollTop === 0) {
        startY = e.touches[0].clientY;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;

      currentY = e.touches[0].clientY;
      const distance = currentY - startY;

      if (distance > 0) {
        e.preventDefault();
        setPullDistance(Math.min(distance * 0.5, pullDownThreshold * 1.5));
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance > pullDownThreshold && !isRefreshing) {
        await onRefresh();
      }
      setPullDistance(0);
      setIsPulling(false);
    };

    container.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isPulling, pullDistance, pullDownThreshold, onRefresh, isRefreshing]);

  return (
    <div ref={containerRef} className={cn("h-full overflow-auto", className)}>
      <motion.div
        className="flex items-center justify-center h-0 overflow-hidden"
        style={{ height: Math.max(0, pullDistance) }}
      >
        <motion.div
          animate={{ rotate: isRefreshing ? 360 : 0 }}
          transition={{
            duration: 1,
            repeat: isRefreshing ? Infinity : 0,
            ease: "linear",
          }}
          className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
        />
      </motion.div>

      <motion.div
        animate={{ y: isRefreshing ? 20 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// Touch Ripple Button
interface TouchRippleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const TouchRippleButton = React.forwardRef<
  HTMLButtonElement,
  TouchRippleButtonProps
>(
  (
    { children, className, variant = "primary", size = "md", ...props },
    ref
  ) => {
    const [ripples, setRipples] = useState<
      Array<{ id: number; x: number; y: number }>
    >([]);
    const { isPressed, handlers } = useTouchFeedback();

    const createRipple = (
      e:
        | React.MouseEvent<HTMLButtonElement>
        | React.TouchEvent<HTMLButtonElement>
    ) => {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();

      let x: number, y: number;

      if ("touches" in e) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
      } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      }

      const newRipple = {
        id: Date.now(),
        x,
        y,
      };

      setRipples((prev) => [...prev, newRipple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);
    };

    const getVariantClasses = () => {
      switch (variant) {
        case "primary":
          return "bg-primary text-primary-foreground";
        case "secondary":
          return "bg-secondary text-secondary-foreground";
        case "ghost":
          return "hover:bg-accent hover:text-accent-foreground";
        default:
          return "bg-primary text-primary-foreground";
      }
    };

    const getSizeClasses = () => {
      switch (size) {
        case "sm":
          return "h-10 px-4 text-sm";
        case "lg":
          return "h-14 px-8 text-lg";
        default:
          return "h-12 px-6 text-base";
      }
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-xl font-medium transition-all duration-200 touch-manipulation",
          "min-h-[44px] min-w-[44px]", // Ensure 44x44px minimum touch target
          getVariantClasses(),
          getSizeClasses(),
          isPressed && "scale-95",
          className
        )}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...handlers}
        onClick={(e) => {
          createRipple(e);
          props.onClick?.(e);
        }}
        {...({ onDrag: undefined, ...props } as any)}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>

        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full pointer-events-none"
            style={{
              left: ripple.x - 20,
              top: ripple.y - 20,
              width: 40,
              height: 40,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </motion.button>
    );
  }
);

TouchRippleButton.displayName = "TouchRippleButton";

// Bottom Sheet Component
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  height?: "auto" | "half" | "full";
  className?: string;
}

export const BottomSheet = ({
  isOpen,
  onClose,
  children,
  title,
  height = "auto",
  className,
}: BottomSheetProps) => {
  const getHeightClass = () => {
    switch (height) {
      case "half":
        return "h-[50vh]";
      case "full":
        return "h-[90vh]";
      default:
        return "h-auto max-h-[80vh]";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl shadow-2xl",
              getHeightClass(),
              className
            )}
          >
            {/* Drag Handle */}
            <div className="flex justify-center py-2">
              <div className="w-12 h-1 bg-muted rounded-full" />
            </div>

            {/* Header */}
            {title && (
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold">{title}</h2>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Floating Action Button
interface FloatingActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const FloatingActionButton = React.forwardRef<
  HTMLButtonElement,
  FloatingActionButtonProps
>(
  (
    {
      icon,
      label,
      position = "bottom-right",
      size = "md",
      className,
      ...props
    },
    ref
  ) => {
    const getPositionClasses = () => {
      switch (position) {
        case "bottom-right":
          return "bottom-6 right-6";
        case "bottom-left":
          return "bottom-6 left-6";
        case "top-right":
          return "top-6 right-6";
        case "top-left":
          return "top-6 left-6";
        default:
          return "bottom-6 right-6";
      }
    };

    const getSizeClasses = () => {
      switch (size) {
        case "sm":
          return "w-12 h-12";
        case "lg":
          return "w-20 h-20";
        default:
          return "w-14 h-14";
      }
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          "fixed z-50 rounded-full shadow-lg elevation-3",
          "bg-primary text-primary-foreground",
          "flex items-center justify-center",
          "touch-manipulation",
          getPositionClasses(),
          getSizeClasses(),
          className
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...({ onDrag: undefined, ...props } as any)}
      >
        <span className="flex items-center justify-center gap-2">
          {icon}
          {label && <span className="text-sm font-medium">{label}</span>}
        </span>
      </motion.button>
    );
  }
);

FloatingActionButton.displayName = "FloatingActionButton";
