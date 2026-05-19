"use client";

/**
 * Stagger animation containers for consistent sequential animations
 * Replaces CSS-based stagger animations with Framer Motion
 */

import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { 
  listContainerVariants, 
  listItemVariants, 
  sectionVariants,
  itemVariants,
} from "@/lib/animations/variants";
import { STAGGER_DELAYS } from "@/lib/animations/config";

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  staggerDelay?: keyof typeof STAGGER_DELAYS;
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  index?: number;
}

/**
 * Container that staggers its direct children
 */
export function StaggerContainer({ 
  children, 
  className = "", 
  delay = 0,
  staggerDelay = "normal" 
}: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      variants={listContainerVariants}
      initial="initial"
      animate="animate"
      transition={{
        staggerChildren: STAGGER_DELAYS[staggerDelay],
        delayChildren: delay,
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Individual stagger item - use inside StaggerContainer
 */
export function StaggerItem({ 
  children, 
  className = "",
  delay = 0,
  index = 0,
}: StaggerItemProps) {
  return (
    <motion.div
      className={className}
      variants={listItemVariants}
      transition={{
        delay: delay + (index * STAGGER_DELAYS.normal),
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Specialized stagger components for common use cases
 */

/**
 * Payment success stagger - replaces .payment-success-stagger CSS class
 */
export function PaymentSuccessStagger({ 
  children, 
  className = "",
  delay = 0,
}: Omit<StaggerItemProps, "index">) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Card stagger - for cards appearing in sequence
 */
export function CardStagger({ 
  children, 
  className = "",
  index = 0,
}: StaggerItemProps) {
  return (
    <motion.div
      className={className}
      variants={itemVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      transition={{
        delay: index * STAGGER_DELAYS.normal,
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Section stagger - for major page sections
 */
export function SectionStagger({ 
  children, 
  className = "",
  delay = 0,
}: Omit<StaggerItemProps, "index">) {
  return (
    <motion.div
      className={className}
      variants={sectionVariants}
      initial="initial"
      animate="animate"
      transition={{
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Hero content stagger - for hero sections with multiple elements
 */
export function HeroStagger({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      variants={{
        initial: { opacity: 0 },
        animate: {
          opacity: 1,
          transition: {
            staggerChildren: STAGGER_DELAYS.dramatic,
            delayChildren: 0.3,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function HeroStaggerItem({ 
  children, 
  className = "" 
}: { 
  children: ReactNode; 
  className?: string 
}) {
  return (
    <motion.div
      className={className}
      variants={{
        initial: { opacity: 0, y: 24, scale: 0.95 },
        animate: { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: {
            duration: 0.6,
            ease: [0.25, 0.1, 0.25, 1],
          }
        },
      }}
    >
      {children}
    </motion.div>
  );
}