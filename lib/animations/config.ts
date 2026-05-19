/**
 * Centralized animation configuration for consistent timing and easing across the app
 * Built on Framer Motion with design system alignment
 */

// Core timing values (in seconds)
export const ANIMATION_DURATIONS = {
  // Fast micro-interactions
  fast: 0.15,
  // Standard UI transitions
  standard: 0.3,
  // Page transitions and complex animations
  slow: 0.5,
  // Special cases (success celebrations, etc.)
  celebration: 0.8,
} as const;

// Standardized easing curves
export const ANIMATION_EASINGS = {
  // Natural motion - good for most UI elements
  natural: [0.4, 0.0, 0.2, 1],
  // Energetic bounce - for success states, celebrations
  bounce: [0.68, -0.6, 0.32, 1.6],
  // Smooth entry - for page loads, content reveals  
  smoothIn: [0.25, 0.1, 0.25, 1],
  // Quick exit - for dismissals, navigation
  quickOut: [0.4, 0.0, 1, 1],
  // Elastic - for interactive elements
  elastic: [0.68, -0.55, 0.265, 1.55],
} as const;

// Stagger timing for sequential animations
export const STAGGER_DELAYS = {
  tight: 0.05,   // For closely related items
  normal: 0.1,   // Standard list items, cards
  loose: 0.15,   // For distinct sections
  dramatic: 0.25, // For emphasis
} as const;

// Motion values for consistent transforms
export const MOTION_VALUES = {
  // Slide distances
  slideDistance: {
    small: 8,
    medium: 16,
    large: 24,
  },
  // Scale values
  scale: {
    press: 0.95,
    hover: 1.02,
    pop: 1.1,
  },
  // Blur amounts
  blur: {
    subtle: 4,
    medium: 8,
    strong: 16,
  },
} as const;

// Page transition configurations
export const PAGE_TRANSITIONS = {
  default: {
    duration: ANIMATION_DURATIONS.standard,
    ease: ANIMATION_EASINGS.natural,
  },
  fast: {
    duration: ANIMATION_DURATIONS.fast,
    ease: ANIMATION_EASINGS.quickOut,
  },
  smooth: {
    duration: ANIMATION_DURATIONS.slow,
    ease: ANIMATION_EASINGS.smoothIn,
  },
  celebration: {
    duration: ANIMATION_DURATIONS.celebration,
    ease: ANIMATION_EASINGS.bounce,
  },
} as const;

// Reduced motion preferences
export const REDUCED_MOTION_CONFIG = {
  // Fallback for users who prefer reduced motion
  duration: 0.01,
  ease: "linear" as const,
};