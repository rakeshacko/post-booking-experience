"use client";

import { cn } from "@/lib/utils";

export type AuroraLightLayerProps = {
  className?: string;
  /** Radial fade — desktop favors top-right; mobile uses a wider centered ellipse so the glow reads on narrow viewports. */
  showRadialGradient?: boolean;
};

/**
 * Light-only aurora mesh (no `dark:` styles, no invert). For cards and sections on white/light UI.
 * Mobile: stronger opacity, softer blur, full-bleed insets, larger background-size so motion stays visible on small screens / iOS Safari.
 */
export function AuroraLightLayer({ className, showRadialGradient = true }: AuroraLightLayerProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 z-0 overflow-hidden", className)}
      aria-hidden
    >
      <div
        className={cn(
          `
            aurora-light-layer-motion
            isolate
            absolute max-sm:bottom-0 max-sm:left-[-40px] max-sm:right-0 max-sm:top-0 sm:bottom-[-10px] sm:left-[-50px] sm:right-[-10px] sm:top-[-10px]
            [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_5%,var(--transparent)_8%,var(--transparent)_10%,var(--white)_14%)]
            [--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)]
            [background-image:var(--white-gradient),var(--aurora)]
            transform-gpu
            will-change-[background-position]
            max-sm:opacity-[0.57]
            max-sm:blur-[8px] max-sm:saturate-[1.064] max-sm:[background-size:480%_300%]
            sm:opacity-[0.456] sm:blur-[10px] sm:saturate-[1.045] sm:[background-size:420%,_260%]
            [background-position:0%_50%,10%_50%]
            after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)]
            after:transform-gpu after:will-change-[background-position]
            max-sm:after:[background-size:340%,_130%]
            sm:after:[background-size:300%,_120%]
            after:animate-aurora after:mix-blend-soft-light
            after:content-[""]
          `,
          showRadialGradient &&
            `
            max-sm:[-webkit-mask-image:radial-gradient(ellipse_130%_100%_at_50%_0%,black_14%,transparent_78%)]
            max-sm:[mask-image:radial-gradient(ellipse_130%_100%_at_50%_0%,black_14%,transparent_78%)]
            sm:[-webkit-mask-image:radial-gradient(ellipse_100%_80%_at_100%_0%,black_10%,var(--transparent)_70%)]
            sm:[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]
            `
        )}
      />
    </div>
  );
}
