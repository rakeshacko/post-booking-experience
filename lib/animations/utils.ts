/**
 * Animation utilities and hooks for common motion patterns
 * Provides reusable animation logic and helpers
 */

import { useAnimation, useInView } from "framer-motion";
import type { Transition } from "framer-motion";
import { useEffect, useRef } from "react";
import { STAGGER_DELAYS, REDUCED_MOTION_CONFIG } from "./config";

function readPrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Hook to check if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  return readPrefersReducedMotion();
}

/**
 * Hook for scroll-triggered animations
 * Animates element when it comes into view
 */
export function useScrollAnimation(threshold = 0.1) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });
  const controls = useAnimation();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (isInView) {
      if (prefersReducedMotion) {
        controls.set("animate");
      } else {
        controls.start("animate");
      }
    }
  }, [isInView, controls, prefersReducedMotion]);

  return { ref, controls, isInView };
}

/**
 * Create staggered animation delays for lists
 */
export function createStaggeredDelays(
  count: number,
  delay: keyof typeof STAGGER_DELAYS = "normal",
  startDelay = 0
): number[] {
  const delayValue = STAGGER_DELAYS[delay];
  return Array.from({ length: count }, (_, i) => startDelay + i * delayValue);
}

/**
 * Get animation config with reduced motion support
 */
export function getAnimationConfig(
  duration: number,
  ease: NonNullable<Transition["ease"]>,
  prefersReducedMotion?: boolean,
) {
  const shouldReduce = prefersReducedMotion ?? readPrefersReducedMotion();

  return {
    duration: shouldReduce ? REDUCED_MOTION_CONFIG.duration : duration,
    ease: shouldReduce ? REDUCED_MOTION_CONFIG.ease : ease,
  };
}

/**
 * Create a staggered container transition
 */
export function createStaggerContainer(
  staggerDelay: keyof typeof STAGGER_DELAYS = "normal",
  delayChildren = 0
) {
  return {
    animate: {
      transition: {
        staggerChildren: STAGGER_DELAYS[staggerDelay],
        delayChildren,
      },
    },
  };
}

/**
 * Common transition presets
 */
export const transitionPresets = {
  // Quick micro-interactions
  quick: {
    duration: 0.15,
    ease: [0.4, 0, 0.2, 1],
  },
  // Standard UI element transitions
  smooth: {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
  },
  // Bouncy, playful animations
  bouncy: {
    duration: 0.5,
    ease: [0.68, -0.6, 0.32, 1.6],
  },
  // Smooth page transitions
  page: {
    duration: 0.4,
    ease: [0.25, 0.1, 0.25, 1],
  },
} as const;

/**
 * Generate consistent hover/tap animations for interactive elements
 */
export function createInteractiveVariants({
  hoverScale = 1.02,
  tapScale = 0.95,
  hoverY = -2,
} = {}) {
  return {
    hover: {
      scale: hoverScale,
      y: hoverY,
      transition: transitionPresets.quick,
    },
    tap: {
      scale: tapScale,
      transition: transitionPresets.quick,
    },
  };
}

/**
 * Create loading/shimmer animation
 */
export function createShimmerAnimation() {
  return {
    animate: {
      backgroundPosition: ["0% 0%", "100% 0%"],
      transition: {
        duration: 1.5,
        ease: "linear",
        repeat: Infinity,
      },
    },
  };
}

/**
 * Page transition helpers for Next.js routing
 */
export function getPageTransitionKey(pathname: string): string {
  // Remove query parameters and fragments for consistent keys
  return pathname.split("?")[0].split("#")[0];
}

/**
 * Determine page transition variant based on route
 */
export function getPageVariant(pathname: string): "default" | "celebration" | "hero" | "fade" {
  // Success/completion pages use celebration variant
  if (
    pathname.includes("success") ||
    pathname.includes("confirmed") ||
    pathname.includes("received") ||
    pathname.includes("sanctioned")
  ) {
    return "celebration";
  }

  // Landing/hero pages use hero variant
  if (pathname === "/" || pathname === "/quote") {
    return "hero";
  }

  // Processing/loading pages use fade variant
  if (pathname.includes("processing") || pathname.includes("pending")) {
    return "fade";
  }

  // Default for all other pages
  return "default";
}

/**
 * Animation performance utilities
 */
export const animationOptimizations = {
  // Force GPU acceleration for smooth animations
  willChange: "transform, opacity",
  // Optimize for animations
  backfaceVisibility: "hidden" as const,
  // Reduce paint complexity
  contain: "layout style paint" as const,
} as const;