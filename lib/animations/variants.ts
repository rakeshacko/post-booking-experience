/**
 * Standard animation variants for consistent motion across the application
 * Uses centralized timing and easing from config.ts
 */

import type { Variants } from "framer-motion";
import {
  ANIMATION_DURATIONS,
  ANIMATION_EASINGS,
  MOTION_VALUES,
  PAGE_TRANSITIONS,
  STAGGER_DELAYS,
} from "./config";

// Page load animations - used for entire page transitions
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: MOTION_VALUES.slideDistance.medium,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      ...PAGE_TRANSITIONS.default,
      when: "beforeChildren",
      staggerChildren: STAGGER_DELAYS.normal,
    },
  },
  exit: {
    opacity: 0,
    y: -MOTION_VALUES.slideDistance.small,
    transition: PAGE_TRANSITIONS.fast,
  },
};

// Smooth page transitions for success/celebration pages
export const celebrationPageVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: MOTION_VALUES.slideDistance.large,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      ...PAGE_TRANSITIONS.celebration,
      staggerChildren: STAGGER_DELAYS.loose,
    },
  },
  exit: {
    opacity: 0,
    scale: 1.02,
    transition: PAGE_TRANSITIONS.fast,
  },
};

// Content section animations - for major page sections
export const sectionVariants: Variants = {
  initial: {
    opacity: 0,
    y: MOTION_VALUES.slideDistance.medium,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATIONS.standard,
      ease: ANIMATION_EASINGS.natural,
    },
  },
};

// Card/item animations - for individual cards, buttons, etc.
export const itemVariants: Variants = {
  initial: {
    opacity: 0,
    y: MOTION_VALUES.slideDistance.small,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATIONS.standard,
      ease: ANIMATION_EASINGS.natural,
    },
  },
  hover: {
    y: -2,
    scale: MOTION_VALUES.scale.hover,
    transition: {
      duration: ANIMATION_DURATIONS.fast,
      ease: ANIMATION_EASINGS.elastic,
    },
  },
  tap: {
    scale: MOTION_VALUES.scale.press,
    transition: {
      duration: ANIMATION_DURATIONS.fast,
      ease: ANIMATION_EASINGS.natural,
    },
  },
};

// Staggered list animations - for lists of items appearing in sequence
export const listContainerVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: STAGGER_DELAYS.normal,
      delayChildren: 0.1,
    },
  },
};

export const listItemVariants: Variants = {
  initial: {
    opacity: 0,
    x: -MOTION_VALUES.slideDistance.medium,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_DURATIONS.standard,
      ease: ANIMATION_EASINGS.smoothIn,
    },
  },
};

// Fade animations - simple opacity transitions
export const fadeVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATIONS.standard,
      ease: ANIMATION_EASINGS.natural,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: ANIMATION_DURATIONS.fast,
      ease: ANIMATION_EASINGS.quickOut,
    },
  },
};

// Slide from directions - for modals, drawers, etc.
export const slideFromBottomVariants: Variants = {
  initial: {
    opacity: 0,
    y: "100%",
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATIONS.standard,
      ease: ANIMATION_EASINGS.natural,
    },
  },
  exit: {
    opacity: 0,
    y: "100%",
    transition: PAGE_TRANSITIONS.fast,
  },
};

export const slideFromTopVariants: Variants = {
  initial: {
    opacity: 0,
    y: "-100%",
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATIONS.standard,
      ease: ANIMATION_EASINGS.natural,
    },
  },
  exit: {
    opacity: 0,
    y: "-100%",
    transition: PAGE_TRANSITIONS.fast,
  },
};

export const slideFromRightVariants: Variants = {
  initial: {
    opacity: 0,
    x: "100%",
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_DURATIONS.standard,
      ease: ANIMATION_EASINGS.natural,
    },
  },
  exit: {
    opacity: 0,
    x: "100%",
    transition: PAGE_TRANSITIONS.fast,
  },
};

export const slideFromLeftVariants: Variants = {
  initial: {
    opacity: 0,
    x: "-100%",
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_DURATIONS.standard,
      ease: ANIMATION_EASINGS.natural,
    },
  },
  exit: {
    opacity: 0,
    x: "-100%",
    transition: PAGE_TRANSITIONS.fast,
  },
};

// Success/celebration specific animations
export const successPopVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0,
    rotate: -180,
  },
  animate: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: ANIMATION_DURATIONS.celebration,
      ease: ANIMATION_EASINGS.bounce,
    },
  },
};

// Loading/shimmer animations
export const shimmerVariants: Variants = {
  initial: {
    backgroundPosition: "-200% 0",
  },
  animate: {
    backgroundPosition: "200% 0",
    transition: {
      duration: 1.5,
      ease: "linear",
      repeat: Infinity,
    },
  },
};

// Form field animations - for input focus states, validation, etc.
export const fieldVariants: Variants = {
  initial: {
    opacity: 0,
    y: MOTION_VALUES.slideDistance.small,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATIONS.standard,
      ease: ANIMATION_EASINGS.natural,
    },
  },
  focus: {
    scale: 1.02,
    transition: {
      duration: ANIMATION_DURATIONS.fast,
      ease: ANIMATION_EASINGS.elastic,
    },
  },
  error: {
    x: [0, -5, 5, -5, 5, 0],
    transition: {
      duration: 0.5,
      ease: ANIMATION_EASINGS.natural,
    },
  },
};

// Hero section animations - for prominent content areas
export const heroVariants: Variants = {
  initial: {
    opacity: 0,
    y: MOTION_VALUES.slideDistance.large,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATIONS.slow,
      ease: ANIMATION_EASINGS.smoothIn,
      staggerChildren: STAGGER_DELAYS.loose,
      delayChildren: 0.2,
    },
  },
};