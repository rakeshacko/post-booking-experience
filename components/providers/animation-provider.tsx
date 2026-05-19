"use client";

/**
 * AnimationProvider - Global animation context and settings
 * Provides AnimatePresence for page transitions and global animation preferences
 */

import { AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

interface AnimationProviderProps {
  children: ReactNode;
}

export function AnimationProvider({ children }: AnimationProviderProps) {
  const pathname = usePathname();

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="wait" initial={false}>
        <div key={pathname}>
          {children}
        </div>
      </AnimatePresence>
    </LazyMotion>
  );
}