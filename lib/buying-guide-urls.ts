import { BUYING_GUIDE_STEP_COUNT } from "@/components/kyc/buying-guide-content";
import {
  JOURNEY_PATHS,
  buyingGuideStepPath,
} from "@/lib/journey-routes";

/** First onboarding step after booking-lock payment success. */
export const BUYING_GUIDE_ENTRY_PATH = JOURNEY_PATHS.buyingGuide.entry;

/** After the fourth onboarding step — KYC pending hub. */
export const BUYING_GUIDE_EXIT_PATH = JOURNEY_PATHS.buyingGuide.exit;

export { buyingGuideStepPath };

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
