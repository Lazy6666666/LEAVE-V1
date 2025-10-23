/**
 * Animation utilities and presets for the Leave Management System
 * Provides consistent animation patterns throughout the application
 */

import { Variants, Transition, MotionProps } from "framer-motion";

// Animation duration constants
export const DURATION = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
} as const;

// Easing functions
export const EASING = {
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  easeOutBack: [0.34, 1.56, 0.64, 1],
  easeOutBackGentle: [0.33, 1.2, 0.58, 1],
  spring: { type: "spring", stiffness: 300, damping: 30 },
  springGentle: { type: "spring", stiffness: 200, damping: 20 },
  springSlow: { type: "spring", stiffness: 100, damping: 15 },
} as const;

// Page transition variants
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: DURATION.normal,
      ease: EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: DURATION.fast,
      ease: EASING.easeIn,
    },
  },
};

// Fade variants
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: DURATION.normal, ease: EASING.easeOut },
  },
  exit: {
    opacity: 0,
    transition: { duration: DURATION.fast, ease: EASING.easeIn },
  },
};

// Slide in variants
export const slideInLeft: Variants = {
  initial: { x: -50, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: DURATION.normal,
      ease: EASING.easeOutBack,
    },
  },
  exit: {
    x: -50,
    opacity: 0,
    transition: { duration: DURATION.fast, ease: EASING.easeIn },
  },
};

export const slideInRight: Variants = {
  initial: { x: 50, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: DURATION.normal,
      ease: EASING.easeOutBack,
    },
  },
  exit: {
    x: 50,
    opacity: 0,
    transition: { duration: DURATION.fast, ease: EASING.easeIn },
  },
};

export const slideInUp: Variants = {
  initial: { y: 30, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: DURATION.normal,
      ease: EASING.easeOutBack,
    },
  },
  exit: {
    y: -30,
    opacity: 0,
    transition: { duration: DURATION.fast, ease: EASING.easeIn },
  },
};

// Scale variants
export const scaleIn: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: DURATION.normal,
      ease: EASING.easeOutBack,
    },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    transition: { duration: DURATION.fast, ease: EASING.easeIn },
  },
};

// Stagger animation for lists
export const staggerContainer: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const staggerItem: Variants = {
  initial: { y: 20, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: DURATION.normal,
      ease: EASING.easeOutBack,
    },
  },
  exit: {
    y: -20,
    opacity: 0,
    transition: { duration: DURATION.fast, ease: EASING.easeIn },
  },
};

// Card hover animation
export const cardHover: Variants = {
  initial: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      duration: DURATION.normal,
      ease: EASING.easeOut,
      type: "spring",
      stiffness: 400,
      damping: 17,
    },
  },
  tap: {
    scale: 0.98,
    transition: { duration: DURATION.fast },
  },
};

// Button animation
export const buttonTap: Variants = {
  initial: { scale: 1 },
  tap: {
    scale: 0.95,
    transition: { duration: DURATION.fast },
  },
  hover: {
    scale: 1.05,
    transition: { duration: DURATION.fast },
  },
};

// Counter animation
export const counterAnimation = {
  initial: { scale: 0.5, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: {
    type: "spring",
    stiffness: 200,
    damping: 15,
  },
};

// Progress bar animation
export const progressAnimation: Variants = {
  initial: { width: 0 },
  animate: {
    width: "var(--progress)",
    transition: {
      duration: DURATION.slow,
      ease: EASING.easeOut,
    },
  },
};

// Notification animation
export const notificationSlide: Variants = {
  initial: { x: 400, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: DURATION.normal,
      ease: EASING.easeOutBack,
    },
  },
  exit: {
    x: 400,
    opacity: 0,
    transition: {
      duration: DURATION.fast,
      ease: EASING.easeIn,
    },
  },
};

// Loading skeleton animation
export const skeletonAnimation: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "reverse",
    },
  },
};

// Gesture animations
export const swipeAnimation = {
  drag: "x" as const,
  dragConstraints: { left: -100, right: 100 },
  dragElastic: 0.2,
  dragTransition: {
    type: "spring",
    stiffness: 300,
    damping: 30,
  },
};

// Preset transitions
export const TRANSITIONS = {
  smooth: { duration: DURATION.normal, ease: EASING.easeInOut },
  snappy: { duration: DURATION.fast, ease: EASING.easeOut },
  bouncy: { type: "spring", stiffness: 400, damping: 10 },
  gentle: { type: "spring", stiffness: 200, damping: 20 },
} as const;

// Custom motion props hook
export const createMotionProps = (
  variants: Variants,
  transition?: Transition
): MotionProps => ({
  initial: "initial",
  animate: "animate",
  exit: "exit",
  variants,
  transition: transition || TRANSITIONS.smooth,
});

// Animation presets for different use cases
export const ANIMATION_PRESETS = {
  page: pageTransition,
  modal: scaleIn,
  dropdown: slideInUp,
  sidebar: slideInLeft,
  tooltip: scaleIn,
  list: staggerContainer,
  listItem: staggerItem,
  card: cardHover,
  button: buttonTap,
  notification: notificationSlide,
  progress: progressAnimation,
} as const;

// Reduced motion support
export const reducedMotion = {
  transition: { duration: 0.01 },
  animate: { opacity: 1 },
  whileHover: undefined,
  whileTap: undefined,
};

// Get animation props with reduced motion support
export const getAnimationProps = (variants: Variants): MotionProps => {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return {
      initial: false,
      animate: { opacity: 1 },
      transition: { duration: 0.01 },
    };
  }

  return {
    initial: "initial",
    animate: "animate",
    exit: "exit",
    variants,
  };
};
