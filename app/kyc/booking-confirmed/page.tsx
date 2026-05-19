import { KycBookingConfirmedScreen } from "@/components/kyc/KycBookingConfirmedScreen";
import { CelebrationPageTransition } from "@/components/ui/page-transition";

/**
 * KYC — booking confirmed success (Figma node 1880:7088).
 */
export default function KycBookingConfirmedPage() {
  return (
    <CelebrationPageTransition>
      <KycBookingConfirmedScreen />
    </CelebrationPageTransition>
  );
}
