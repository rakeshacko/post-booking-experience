/**
 * Shared vertical rhythm for KYC hero + celebration success screens.
 * Processing heroes anchor below the nav; celebration screens anchor from the page top.
 */

/** Offset from anchor (nav bottom or page top) to hero icon / Lottie top — 72px. */
export const HERO_ICON_TOP_PT = "pt-[72px]";

/** Space between headline (h1) and subtext / subline on success screens — 8px. */
export const SUCCESS_SCREEN_HEADLINE_SUBTEXT_GAP_CLASS = "gap-2";

/** Action hero pages (nav + illustration + CTA) — headline to subline — 16px. */
export const HERO_ACTION_HEADLINE_SUBLINE_GAP_CLASS = "gap-4";

/** Celebration Lottie (104×104) bottom → headline block — 8px. */
export const CELEBRATION_LOTTIE_TO_HEADLINE_MT = "mt-[8px]";

/**
 * Processing hero illustration (80×80) bottom → copy block — 32px.
 * Matches celebration rhythm: 80 + 32 = 104 + 8.
 */
export const HERO_ILLUSTRATION_TO_COPY_MT = "mt-8";
