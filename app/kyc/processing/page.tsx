import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";
import { FadePageTransition } from "@/components/ui/page-transition";
import { JOURNEY_PATHS } from "@/lib/journey-routes";

/**
 * Post-documents booking processing — Figma node 1880:6887.
 */
export default function KycProcessingPage() {
  return (
    <FadePageTransition>
      <KycBookingProcessingScreen
        nextHref={JOURNEY_PATHS.kyc.bookingAccepted}
        prefetchHref={JOURNEY_PATHS.kyc.bookingAccepted}
      />
    </FadePageTransition>
  );
}
