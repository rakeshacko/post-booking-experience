import { KycVerificationInProgressScreen } from "@/components/kyc/KycVerificationInProgressScreen";

/**
 * KYC verification in progress — between documents received and booking processing.
 * Layout matches `/kyc` (no page transition wrapper).
 */
export default function KycVerificationInProgressPage() {
  return <KycVerificationInProgressScreen />;
}
