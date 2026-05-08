"use client";

/**
 * PageTransition - Consistent page load animations wrapper
 * Provides standardized enter/exit animations for all pages
 */

import { motion, type Transition, type Variants } from "framer-motion";
import { type ReactNode, useSyncExternalStore } from "react";
import {
  pageVariants,
  celebrationPageVariants,
  heroVariants,
  fadeVariants,
} from "@/lib/animations/variants";
import { REDUCED_MOTION_CONFIG } from "@/lib/animations/config";

function subscribePrefersReducedMotion(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getPrefersReducedMotionSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function animateTransitionFromVariants(variants: Variants): Transition | undefined {
  const animate = variants.animate;
  if (!animate || typeof animate !== "object") return undefined;
  const t = "transition" in animate ? animate.transition : undefined;
  return t && typeof t === "object" ? t : undefined;
}

export type PageTransitionVariant = "default" | "celebration" | "hero" | "fade";

interface PageTransitionProps {
  children: ReactNode;
  variant?: PageTransitionVariant;
  className?: string;
  /**
   * Unique key for page transitions - should change when navigating between pages
   * If not provided, will use pathname from useRouter
   */
  pageKey?: string;
  /**
   * Disable animations (useful for testing or user preference)
   */
  disableAnimation?: boolean;
}

export function PageTransition({
  children,
  variant = "default",
  className = "",
  pageKey,
  disableAnimation = false,
}: PageTransitionProps) {
  // Get the appropriate variants based on the variant prop
  const getVariants = () => {
    switch (variant) {
      case "celebration":
        return celebrationPageVariants;
      case "hero":
        return heroVariants;
      case "fade":
        return fadeVariants;
      default:
        return pageVariants;
    }
  };

  const variants = getVariants();
  const animateTransition = animateTransitionFromVariants(variants);

  const prefersReducedMotion = useSyncExternalStore(
    subscribePrefersReducedMotion,
    getPrefersReducedMotionSnapshot,
    () => false,
  );

  // If animations are disabled, return children without motion
  if (disableAnimation) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      key={pageKey}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      className={className}
      // Respect user's reduced motion preference
      transition={{
        ...animateTransition,
        duration: prefersReducedMotion
          ? REDUCED_MOTION_CONFIG.duration
          : animateTransition?.duration,
        ease: prefersReducedMotion ? REDUCED_MOTION_CONFIG.ease : animateTransition?.ease,
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Specialized page transitions for common use cases
 */

export function DefaultPageTransition({ children, className, pageKey }: Omit<PageTransitionProps, "variant">) {
  return (
    <PageTransition variant="default" className={className} pageKey={pageKey}>
      {children}
    </PageTransition>
  );
}

export function CelebrationPageTransition({ children, className, pageKey }: Omit<PageTransitionProps, "variant">) {
  return (
    <PageTransition variant="celebration" className={className} pageKey={pageKey}>
      {children}
    </PageTransition>
  );
}

export function HeroPageTransition({ children, className, pageKey }: Omit<PageTransitionProps, "variant">) {
  return (
    <PageTransition variant="hero" className={className} pageKey={pageKey}>
      {children}
    </PageTransition>
  );
}

export function FadePageTransition({ children, className, pageKey }: Omit<PageTransitionProps, "variant">) {
  return (
    <PageTransition variant="fade" className={className} pageKey={pageKey}>
      {children}
    </PageTransition>
  );
}