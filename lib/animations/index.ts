/**
 * Animation system exports
 * Centralized access to all animation utilities, variants, and components
 */

// Core configuration
export * from "./config";

// Animation variants
export * from "./variants";

// Utility functions and hooks
export * from "./utils";

// Re-export commonly used Framer Motion components for convenience
export { motion, AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
export type { Variants, Transition, MotionProps } from "framer-motion";