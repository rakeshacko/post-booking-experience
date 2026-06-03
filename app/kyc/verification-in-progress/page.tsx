import { KycVerificationInProgressPageClient } from "@/components/kyc/KycVerificationInProgressPageClient";

/**
 * KYC verification in progress — between documents received and booking processing.
 * Next routes to `/kyc/processing` (Express) or `/kyc/verification-failed` (verification-failed flow).
 */
export default function KycVerificationInProgressPage() {
  return <KycVerificationInProgressPageClient />;
}
