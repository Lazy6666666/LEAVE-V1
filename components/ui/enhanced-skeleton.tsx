/**
 * Enhanced Skeleton Components with Beautiful Loading Animations
 * Provides various skeleton patterns for different UI elements
 */

"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Skeleton variants
const skeletonVariants = cva("bg-muted", {
  variants: {
    variant: {
      default: "bg-muted",
      card: "bg-card",
      text: "bg-muted",
      image: "bg-muted",
      circular: "bg-muted",
    },
    animation: {
      shimmer: "animate-shimmer",
      pulse: "animate-pulse",
      wave: "animate-wave",
      none: "",
    },
  },
  defaultVariants: {
    variant: "default",
    animation: "shimmer",
  },
});

// Animation keyframes
export const shimmerAnimation = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    background: [
      "hsl(210, 40%, 92%)",
      "hsl(210, 40%, 86%)",
      "hsl(210, 40%, 92%)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

export const pulseAnimation = {
  initial: { opacity: 1 },
  animate: {
    opacity: [0.4, 1, 0.4],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const waveAnimation = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.02, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Base Skeleton Component
export interface SkeletonProps extends HTMLMotionProps<"div"> {
  as?: React.ElementType;
  animated?: boolean;
  className?: string;
  variant?: any;
  animation?: any;
}

const Skeleton = ({
  className,
  variant,
  animation,
  as: Component = "div",
  animated = true,
  children,
  ...props
}: SkeletonProps) => {
  const animationVariant = animated
    ? animation === "shimmer"
      ? shimmerAnimation
      : animation === "pulse"
        ? pulseAnimation
        : animation === "wave"
          ? waveAnimation
          : {}
    : {};

  if (children) {
    return (
      <Component
        className={cn(skeletonVariants({ variant }), className)}
        {...props}
      >
        {children}
      </Component>
    );
  }

  return (
    <motion.div
      initial={animated ? "initial" : false}
      animate={animated ? "animate" : false}
      variants={animationVariant}
      className={cn(
        skeletonVariants({ variant, animation: animated ? animation : "none" }),
        className
      )}
      {...props}
    />
  );
};

// Skeleton Card Component
export interface SkeletonCardProps {
  showAvatar?: boolean;
  showHeader?: boolean;
  lines?: number;
  showFooter?: boolean;
  className?: string;
}

const SkeletonCard = ({
  showAvatar = true,
  showHeader = true,
  lines = 3,
  showFooter = true,
  className,
}: SkeletonCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("rounded-lg border bg-card p-6 space-y-4", className)}
    >
      {showAvatar && (
        <div className="flex items-center space-x-4">
          <Skeleton variant="circular" className="h-12 w-12" />
          <div className="space-y-2 flex-1">
            {showHeader && (
              <>
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-1/3" />
              </>
            )}
          </div>
        </div>
      )}

      {!showAvatar && showHeader && (
        <div className="space-y-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )}

      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className={cn("h-4", i === lines - 1 && "w-3/4")} />
        ))}
      </div>

      {showFooter && (
        <div className="flex items-center justify-between pt-4">
          <Skeleton className="h-8 w-20 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      )}
    </motion.div>
  );
};

// Skeleton List Component
export interface SkeletonListProps {
  items?: number;
  showAvatar?: boolean;
  className?: string;
}

const SkeletonList = ({
  items = 5,
  showAvatar = true,
  className,
}: SkeletonListProps) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        initial: { opacity: 0 },
        animate: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className={cn("space-y-4", className)}
    >
      {Array.from({ length: items }).map((_, i) => (
        <motion.div
          key={i}
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: {
              opacity: 1,
              y: 0,
              transition: {
                delay: i * 0.1,
                duration: 0.3,
              },
            },
          }}
        >
          <div className="flex items-center space-x-4 p-4 rounded-lg border">
            {showAvatar && (
              <Skeleton
                variant="circular"
                className="h-10 w-10 flex-shrink-0"
              />
            )}
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-16 rounded flex-shrink-0" />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

// Skeleton Table Component
export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

const SkeletonTable = ({
  rows = 5,
  columns = 4,
  className,
}: SkeletonTableProps) => {
  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="flex space-x-4 p-4 border-b font-medium">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-6 flex-1" />
        ))}
      </div>

      {/* Rows */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={{
          initial: { opacity: 0 },
          animate: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05,
            },
          },
        }}
        className="divide-y"
      >
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <motion.div
            key={`row-${rowIndex}`}
            variants={{
              initial: { opacity: 0, x: -20 },
              animate: {
                opacity: 1,
                x: 0,
                transition: {
                  delay: rowIndex * 0.05,
                  duration: 0.3,
                },
              },
            }}
            className="flex space-x-4 p-4"
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={`cell-${rowIndex}-${colIndex}`}
                className={cn("h-4 flex-1", colIndex === columns - 1 && "w-20")}
              />
            ))}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

// Skeleton Chart Component
export interface SkeletonChartProps {
  type?: "bar" | "line" | "pie";
  className?: string;
}

const SkeletonChart = ({ type = "bar", className }: SkeletonChartProps) => {
  if (type === "bar") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={cn("p-6 rounded-lg border", className)}
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-end space-x-2 h-32">
            {Array.from({ length: 7 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${Math.random() * 100}%` }}
                transition={{
                  delay: i * 0.1,
                  duration: 0.5,
                  ease: "easeOut",
                }}
                className="flex-1 bg-muted rounded-t"
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (type === "line") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={cn("p-6 rounded-lg border", className)}
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="h-32 flex items-center justify-center">
            <svg width="100%" height="100%" className="overflow-visible">
              <motion.path
                d="M 0 64 Q 40 20 80 40 T 160 32 T 240 48 T 320 24"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-muted"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </svg>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("p-6 rounded-lg border", className)}
    >
      <div className="space-y-4">
        <div className="flex justify-center">
          <Skeleton className="h-32 w-32 rounded-full" />
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <Skeleton className="h-3 w-3 rounded" />
              <Skeleton className="h-3 flex-1" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Loading State Component
export interface LoadingStateProps {
  isLoading?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

const LoadingState = ({
  isLoading = false,
  children,
  fallback,
  className,
}: LoadingStateProps) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn("flex items-center justify-center p-8", className)}
    >
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
            className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full"
          />
        </div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </motion.div>
  );
};

// Export all components
export {
  Skeleton,
  SkeletonCard,
  SkeletonList,
  SkeletonTable,
  SkeletonChart,
  LoadingState,
};
