/**
 * Motion Components - Enhanced UI components with animations
 * These components wrap existing shadcn/ui components with Framer Motion animations
 */

"use client";

import { motion, MotionProps } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import {
  cardHover,
  buttonTap,
  scaleIn,
  staggerContainer,
  staggerItem,
  pageTransition,
  fadeIn,
  getAnimationProps,
} from "@/lib/animations";

// Import base components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { Progress } from "./progress";

// Motion Card Component

export interface MotionCardProps {
  withAnimation?: boolean;
  animationVariant?: "hover" | "scale" | "none";
  motionProps?: MotionProps;
  className?: string;
  children?: React.ReactNode;
}

const MotionCard = forwardRef<HTMLDivElement, MotionCardProps>(
  (
    {
      className,
      children,
      withAnimation = true,
      animationVariant = "hover",
      motionProps = {},
      ...props
    },
    ref
  ) => {
    if (!withAnimation) {
      return (
        <Card ref={ref} className={className} {...props}>
          {children}
        </Card>
      );
    }

    const animationProps = getAnimationProps(
      animationVariant === "hover"
        ? cardHover
        : animationVariant === "scale"
          ? scaleIn
          : fadeIn
    );

    return (
      <motion.div ref={ref} {...animationProps} {...motionProps}>
        <Card className={cn("cursor-pointer", className)} {...props}>
          {children}
        </Card>
      </motion.div>
    );
  }
);
MotionCard.displayName = "MotionCard";

// Motion Card Content
export const MotionCardContent = motion(CardContent);
export const MotionCardHeader = motion(CardHeader);
export const MotionCardTitle = motion(CardTitle);
export const MotionCardDescription = motion(CardDescription);
export const MotionCardFooter = motion(CardFooter);

// Motion Button Component
export interface MotionButtonProps {
  withTapAnimation?: boolean;
  motionProps?: MotionProps;
  className?: string;
  children?: React.ReactNode;
}

const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
  (
    {
      className,
      children,
      withTapAnimation = true,
      motionProps = {},
      ...props
    },
    ref
  ) => {
    const animationProps = withTapAnimation ? getAnimationProps(buttonTap) : {};

    return (
      <motion.button ref={ref} {...animationProps} {...motionProps}>
        <Button className={className} {...props}>
          {children}
        </Button>
      </motion.button>
    );
  }
);
MotionButton.displayName = "MotionButton";

// Motion Badge Component
export interface MotionBadgeProps {
  withScaleAnimation?: boolean;
  motionProps?: MotionProps;
  className?: string;
  children?: React.ReactNode;
}

const MotionBadge = forwardRef<HTMLDivElement, MotionBadgeProps>(
  (
    {
      className,
      children,
      withScaleAnimation = true,
      motionProps = {},
      ...props
    },
    ref
  ) => {
    const animationProps = withScaleAnimation ? getAnimationProps(scaleIn) : {};

    return (
      <motion.div ref={ref} {...animationProps} {...motionProps}>
        <Badge className={className} {...props}>
          {children}
        </Badge>
      </motion.div>
    );
  }
);
MotionBadge.displayName = "MotionBadge";

// Motion Progress Component
export interface MotionProgressProps {
  withAnimation?: boolean;
  motionProps?: MotionProps;
  className?: string;
  value?: number;
}

const MotionProgress = forwardRef<HTMLDivElement, MotionProgressProps>(
  (
    { className, value = 0, withAnimation = true, motionProps = {}, ...props },
    ref
  ) => {
    const animationProps = withAnimation
      ? {
          initial: { width: 0 },
          animate: { width: `${value}%` },
          transition: { duration: 0.8, ease: "easeOut" },
          ...motionProps,
        }
      : {};

    return (
      <motion.div ref={ref} {...animationProps}>
        <Progress value={value} className={className} {...props} />
      </motion.div>
    );
  }
);
MotionProgress.displayName = "MotionProgress";

// Motion List Component for staggered animations
export interface MotionListProps {
  staggerDelay?: number;
  motionProps?: MotionProps;
  className?: string;
  children?: React.ReactNode;
}

const MotionList = forwardRef<HTMLDivElement, MotionListProps>(
  (
    { className, children, staggerDelay = 0.1, motionProps = {}, ...props },
    ref
  ) => {
    const variants = {
      ...staggerContainer,
      animate: {
        ...staggerContainer.animate,
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: 0.2,
        },
      },
    };

    const animationProps = getAnimationProps(variants);

    return (
      <motion.div
        ref={ref}
        {...animationProps}
        {...motionProps}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
MotionList.displayName = "MotionList";

// Motion List Item Component
export interface MotionListItemProps {
  motionProps?: MotionProps;
  className?: string;
  children?: React.ReactNode;
}

const MotionListItem = forwardRef<HTMLDivElement, MotionListItemProps>(
  ({ className, children, motionProps = {}, ...props }, ref) => {
    const animationProps = getAnimationProps(staggerItem);

    return (
      <motion.div
        ref={ref}
        {...animationProps}
        {...motionProps}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
MotionListItem.displayName = "MotionListItem";

// Page Transition Component
export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  motionProps?: MotionProps;
}

export const PageTransition = ({
  children,
  className,
  motionProps = {},
}: PageTransitionProps) => {
  const animationProps = getAnimationProps(pageTransition);

  return (
    <motion.div {...animationProps} {...motionProps} className={className}>
      {children}
    </motion.div>
  );
};

// Fade In Component
export interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  motionProps?: MotionProps;
}

export const FadeIn = ({
  children,
  className,
  delay = 0,
  duration = 0.3,
  motionProps = {},
}: FadeInProps) => {
  const variants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration, delay, ease: "easeOut" as const },
    },
  };

  const animationProps = getAnimationProps(variants);

  return (
    <motion.div {...animationProps} {...motionProps} className={className}>
      {children}
    </motion.div>
  );
};

// Slide Up Component
export interface SlideUpProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  motionProps?: MotionProps;
}

export const SlideUp = ({
  children,
  className,
  delay = 0,
  duration = 0.3,
  motionProps = {},
}: SlideUpProps) => {
  const variants = {
    initial: { y: 30, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: { duration, delay, ease: [0.34, 1.56, 0.64, 1] as const },
    },
  };

  const animationProps = getAnimationProps(variants);

  return (
    <motion.div {...animationProps} {...motionProps} className={className}>
      {children}
    </motion.div>
  );
};

// Scale In Component
export interface ScaleInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  motionProps?: MotionProps;
}

export const ScaleIn = ({
  children,
  className,
  delay = 0,
  duration = 0.3,
  motionProps = {},
}: ScaleInProps) => {
  const variants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { duration, delay, ease: [0.34, 1.56, 0.64, 1] as const },
    },
  };

  const animationProps = getAnimationProps(variants);

  return (
    <motion.div {...animationProps} {...motionProps} className={className}>
      {children}
    </motion.div>
  );
};
