/**
 * Green hero tint that dissolves into the page background (#f1f0f5) instead of
 * ending on a hard line. The vertical overlay (rendered first, so it sits on
 * top) stays invisible through the nav + milestone rail, then fades to the page
 * colour by the bottom of the (taller) hero box — Safari-safe same-hue 0-alpha
 * start, never the `transparent` keyword.
 */
export const LOAN_APPLICATION_HERO_GRADIENT_STYLE = {
  backgroundImage:
    "linear-gradient(180deg, rgba(241,240,245,0) 0%, rgba(241,240,245,0) 52%, #f1f0f5 100%), linear-gradient(114.23deg, #f1ffe8 0%, #e4fafa 100%)",
} as const;

/** The hero gradient box extends past the rail so its fade lands in the content. */
export const LOAN_APPLICATION_HERO_GRADIENT_BOX_CLASS =
  "pointer-events-none absolute left-0 right-0 top-0 h-[248px]";

/** Gradient extends 20px below the milestone rail. */
export const LOAN_APPLICATION_HERO_MILESTONE_CLASS = "w-full shrink-0 pt-1 pb-5";

/** Page title starts 24px below where the hero gradient ends. */
export const LOAN_APPLICATION_PAGE_TITLE_CLASS =
  "mt-6 text-xl font-semibold leading-7 tracking-[-0.1px] text-[#121212]";

export const LOAN_APPLICATION_MAIN_CLASS = "relative z-10 flex-1 px-5 pb-32";

export const LOAN_APPLICATION_SECTION_LABEL_CLASS =
  "text-sm font-medium leading-5 text-[#121212]";

/** 24px between major sections (Figma). */
export const LOAN_APPLICATION_SECTION_GAP_CLASS = "mt-6";

/** 32px between stacked placeholder fields (Figma personal screen). */
export const LOAN_APPLICATION_FIELD_STACK_GAP_CLASS = "mt-8";

/** Divider between personal and work blocks — full bleed within main, dashed. */
export const LOAN_APPLICATION_SECTION_DIVIDER_CLASS =
  "mt-8 -mx-5 border-t border-dashed border-[#e8e8e8]";

/** 12px from section label to field/chips. */
export const LOAN_APPLICATION_FIELD_GAP_CLASS = "mt-3";

/** 20px from page title to content below. */
export const LOAN_APPLICATION_TITLE_TO_CARD_GAP_CLASS = "mt-5";

/** 14px — inputs, amount field, and segment chips. */
export const LOAN_APPLICATION_CONTROL_TEXT_CLASS = "text-sm font-normal leading-5";

/**
 * Page load sequence — nav, milestone rail, and fixed CTA stay immediate;
 * main content uses `LoanApplicationPageStagger` (same motion as payment-success-stagger).
 */
export const LOAN_APPLICATION_STAGGER_MS = {
  title: 90,
  subtitle: 180,
  card: 300,
  blockAfterSubtitle: 270,
  sectionStep: 90,
  documentsInfo: 240,
  documentsAadhaar: 320,
  documentsPan: 400,
  cta: 540,
} as const;

export function loanApplicationStaggerAfterCard(sectionIndex: number): number {
  return (
    LOAN_APPLICATION_STAGGER_MS.card +
    sectionIndex * LOAN_APPLICATION_STAGGER_MS.sectionStep
  );
}
