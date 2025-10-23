/**
 * Interactive UI Elements with Enhanced Animations
 * Provides animated components for better user engagement
 */

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import { useInView } from "react-intersection-observer";
import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// Animated Stat Card Component
interface AnimatedStatCardProps {
  value: number;
  label: string;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  className?: string;
  duration?: number;
}

export const AnimatedStatCard = ({
  value,
  label,
  change,
  changeLabel,
  icon,
  className,
  duration = 1000,
}: AnimatedStatCardProps) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView && !isVisible) {
      setIsVisible(true);
      const timer = setInterval(() => {
        setCount((prev) => {
          if (prev < value) {
            return Math.min(prev + Math.ceil(value / 20), value);
          } else {
            clearInterval(timer);
            return value;
          }
        });
      }, duration / 20);

      return () => clearInterval(timer);
    }
  }, [inView, isVisible, value, duration]);

  const getChangeIcon = () => {
    if (!change) return <Minus className="w-4 h-4" />;
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  const getChangeColor = () => {
    if (!change) return "text-muted-foreground";
    if (change > 0) return "text-success";
    return "text-destructive";
  };

  return (
    <div
      ref={ref}
      className={cn("group cursor-pointer opacity-0 translate-y-5 animate-in", className)}
    >
      <Card className="elevation-hover-2">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <motion.p
                className="text-3xl font-bold text-gradient-enhanced"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={isVisible ? { scale: 1, opacity: 1 } : {}}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                {count.toLocaleString()}
              </motion.p>
              <p className="text-sm text-muted-foreground">{label}</p>
              {change !== undefined && (
                <motion.div
                  className={cn(
                    "flex items-center gap-1 text-xs",
                    getChangeColor()
                  )}
                  initial={{ opacity: 0 }}
                  animate={isVisible ? { opacity: 1 } : {}}
                  transition={{ delay: 0.3 }}
                >
                  {getChangeIcon()}
                  <span>
                    {change > 0 ? "+" : ""}
                    {change}%{changeLabel && ` ${changeLabel}`}
                  </span>
                </motion.div>
              )}
            </div>
            <div
              className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors hover:scale-110 hover:rotate-5 active:scale-95 transform"
            >
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Interactive Card Component
interface InteractiveCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  hover?: boolean;
  press?: boolean;
}

export const InteractiveCard = ({
  children,
  onClick,
  className,
  hover = true,
  press = true,
}: InteractiveCardProps) => {
  return (
    <motion.div
      className={cn("cursor-pointer", className)}
      onClick={onClick}
      whileHover={hover ? { scale: 1.02, y: -4 } : undefined}
      whileTap={press ? { scale: 0.98 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6">{children}</CardContent>
      </Card>
    </motion.div>
  );
};

// Swipeable Card Component
interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export const SwipeableCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  className,
  leftAction,
  rightAction,
}: SwipeableCardProps) => {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handlers = useSwipeable({
    onSwipedLeft: onSwipeLeft,
    onSwipedRight: onSwipeRight,
    onSwiping: (e) => {
      setDragOffset(e.deltaX);
      setIsDragging(true);
    },
    onSwiped: () => {
      setDragOffset(0);
      setIsDragging(false);
    },
    trackMouse: true,
  });

  return (
    <div className={cn("relative overflow-hidden", className)} {...handlers}>
      {/* Left Action */}
      <AnimatePresence>
        {dragOffset > 50 && leftAction && (
          <motion.div
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            exit={{ x: -100 }}
            className="absolute left-0 top-0 bottom-0 flex items-center px-4 bg-success text-white z-10"
          >
            {leftAction}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Action */}
      <AnimatePresence>
        {dragOffset < -50 && rightAction && (
          <motion.div
            initial={{ x: 100 }}
            animate={{ x: 0 }}
            exit={{ x: 100 }}
            className="absolute right-0 top-0 bottom-0 flex items-center px-4 bg-destructive text-white z-10"
          >
            {rightAction}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        style={{ x: dragOffset }}
        transition={
          isDragging
            ? { type: "tween" }
            : { type: "spring", stiffness: 300, damping: 30 }
        }
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        dragElastic={0.2}
      >
        <Card
          className={cn(
            dragOffset > 50 && "border-l-4 border-l-success",
            dragOffset < -50 && "border-r-4 border-r-destructive"
          )}
        >
          <CardContent className="p-6">{children}</CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

// Animated Progress Ring Component
interface AnimatedProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
  color?: string;
}

export const AnimatedProgressRing = ({
  value,
  size = 120,
  strokeWidth = 8,
  className,
  children,
  color = "var(--color-primary)",
}: AnimatedProgressRingProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) setIsVisible(true);
  }, [inView]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div
      ref={ref}
      className={cn(
        "relative inline-flex items-center justify-center",
        className
      )}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--color-muted)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={
            isVisible
              ? { strokeDashoffset }
              : { strokeDashoffset: circumference }
          }
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            delay: 0.2,
          }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
};

// Hover Tooltip Component
interface HoverTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export const HoverTooltip = ({
  children,
  content,
  side = "top",
  className,
}: HoverTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const getPosition = () => {
    switch (side) {
      case "top":
        return "bottom-full left-1/2 transform -translate-x-1/2 mb-2";
      case "bottom":
        return "top-full left-1/2 transform -translate-x-1/2 mt-2";
      case "left":
        return "right-full top-1/2 transform -translate-y-1/2 mr-2";
      case "right":
        return "left-full top-1/2 transform -translate-y-1/2 ml-2";
      default:
        return "bottom-full left-1/2 transform -translate-x-1/2 mb-2";
    }
  };

  const getArrow = () => {
    switch (side) {
      case "top":
        return "top-full left-1/2 transform -translate-x-1/2 -mt-1";
      case "bottom":
        return "bottom-full left-1/2 transform -translate-x-1/2 mt-1 rotate-180";
      case "left":
        return "left-full top-1/2 transform -translate-y-1/2 -ml-1 rotate-90";
      case "right":
        return "right-full top-1/2 transform -translate-y-1/2 mr-1 -rotate-90";
      default:
        return "top-full left-1/2 transform -translate-x-1/2 -mt-1";
    }
  };

  return (
    <div
      className={cn("relative inline-block", className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap",
              getPosition()
            )}
          >
            {content}
            <div
              className={cn(
                "absolute w-2 h-2 bg-gray-900 transform rotate-45",
                getArrow()
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Ripple Effect Button Component
interface RippleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const RippleButton = ({
  children,
  className,
  onClick,
  ...props
}: RippleButtonProps) => {
  const [ripples, setRipples] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    onClick?.(e);
  };

  return (
    <motion.button
      className={cn(
        "relative overflow-hidden transition-all duration-300 active:scale-95 transform transition-transform",
        className
      )}
      onClick={handleClick}
      {...({ onDrag: undefined, ...props } as any)}
    >
      {children}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
    </motion.button>
  );
};

// Components are already exported inline
