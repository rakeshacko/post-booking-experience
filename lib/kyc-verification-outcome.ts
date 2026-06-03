import { readExperienceFlow } from "@/lib/experience-flow";
import { JOURNEY_PATHS } from "@/lib/journey-routes";

export const KYC_VERIFICATION_HAPPY_HREF = JOURNEY_PATHS.kyc.processing;
export const KYC_VERIFICATION_FAILED_HREF = JOURNEY_PATHS.kyc.verificationFailed;

/** Where verification-in-progress should go when the user taps Next. */
export function getKycVerificationNextHref(): string {
  return readExperienceFlow() === "kyc_failed"
    ? KYC_VERIFICATION_FAILED_HREF
    : KYC_VERIFICATION_HAPPY_HREF;
}

export function isVerificationFailedFlow(): boolean {
  return readExperienceFlow() === "kyc_failed";
}
