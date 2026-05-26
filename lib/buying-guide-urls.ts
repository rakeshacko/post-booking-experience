import { BUYING_GUIDE_STEP_COUNT } from "@/components/kyc/buying-guide-content";

/** First onboarding step after booking-lock payment success. */
export const BUYING_GUIDE_ENTRY_PATH = "/kyc/buying-guide/1";

/** After the fourth onboarding step — KYC pending hub. */
export const BUYING_GUIDE_EXIT_PATH = "/kyc";

export function buyingGuideStepPath(step: number): string {
  return `/kyc/buying-guide/${step}`;
}

export function buyingGuideNextPath(currentStep: number): string {
  if (currentStep >= BUYING_GUIDE_STEP_COUNT) {
    return BUYING_GUIDE_EXIT_PATH;
  }
  return buyingGuideStepPath(currentStep + 1);
}

export function buyingGuidePrevPath(currentStep: number): string | null {
  if (currentStep <= 1) return null;
  return buyingGuideStepPath(currentStep - 1);
}
