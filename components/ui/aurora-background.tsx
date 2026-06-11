"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

import { AuroraLightLayer } from "@/components/ui/aurora-light-layer";

export interface AuroraBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

/** Full-viewport light aurora backdrop (no dark theme variant). */
export function AuroraBackground({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-dvh flex-col items-center justify-center bg-[#f1f0f5] text-slate-950 transition-colors",
        className
      )}
      {...props}
    >
      <AuroraLightLayer showRadialGradient={showRadialGradient} />
      <div className="relative z-10 flex w-full flex-col items-center justify-center">{children}</div>
    </div>
  );
}
