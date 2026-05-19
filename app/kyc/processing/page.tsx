import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";
import { FadePageTransition } from "@/components/ui/page-transition";

/**
 * Post-documents booking processing — Figma node 1880:6887.
 */
export default function KycProcessingPage() {
  return (
    <FadePageTransition>
      <KycBookingProcessingScreen />
    </FadePageTransition>
  );
}
