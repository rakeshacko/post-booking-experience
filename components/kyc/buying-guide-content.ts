import type { StaticImageData } from "next/image";

/**
 * Buying process onboarding — Figma:
 * [Step 1](https://www.figma.com/design/nW5SWmJdxxsCEDlqBN7C0L/Post-booking-experience?node-id=2460-7661) ·
 * [Step 2](https://www.figma.com/design/nW5SWmJdxxsCEDlqBN7C0L/Post-booking-experience?node-id=2460-7772) ·
 * [Step 3](https://www.figma.com/design/nW5SWmJdxxsCEDlqBN7C0L/Post-booking-experience?node-id=2460-7801) ·
 * [Step 4](https://www.figma.com/design/nW5SWmJdxxsCEDlqBN7C0L/Post-booking-experience?node-id=2460-7830) → `/kyc`
 */
export const BUYING_GUIDE_STEP_COUNT = 4;

export type BuyingGuideStep = {
  step: number;
  title: string;
  body: string;
  ctaLabel: string;
  /** Optional hero illustration — add when assets are ready. */
  imageSrc?: StaticImageData | string;
};

export const BUYING_GUIDE_STEPS: readonly BuyingGuideStep[] = [
  {
    step: 1,
    title: "Verify yourself",
    body: "We need to confirm who you are before we can start working on your booking. Takes 2 min, just PAN and Aadhaar.",
    ctaLabel: "Next",
  },
  {
    step: 2,
    title: "We find and confirm your car",
    body: "ACKO Drive finds the best dealer with your exact variant and colour in stock and confirms your booking with them.",
    ctaLabel: "Next",
  },
  {
    step: 3,
    title: "Complete your payment",
    body: "Pay the remaining amount your way. Whether you are financing or paying in full, we will help you sort it out.",
    ctaLabel: "Next",
  },
  {
    step: 4,
    title: "Get your car delivered",
    body: "Pick a date that works for you. We will confirm the dealer and location where you can take delivery.",
    ctaLabel: "Let's get started",
  },
] as const;

export function getBuyingGuideStep(step: number): BuyingGuideStep | undefined {
  return BUYING_GUIDE_STEPS.find((item) => item.step === step);
}

export function isBuyingGuideStep(value: number): value is 1 | 2 | 3 | 4 {
  return Number.isInteger(value) && value >= 1 && value <= BUYING_GUIDE_STEP_COUNT;
}
