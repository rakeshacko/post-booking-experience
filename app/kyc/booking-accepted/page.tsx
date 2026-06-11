import { ConciergeMoment } from "@/components/concierge/ConciergeMoment";
import { ModifyNoChargesGatedPage } from "@/components/kyc/ModifyNoChargesGatedPage";
import { FadePageTransition } from "@/components/ui/page-transition";

/**
 * Dealer found — Shivi reserved the exact car; OTP confirmation expected.
 */
export default function KycBookingAcceptedPage() {
  return (
    <ModifyNoChargesGatedPage>
      <FadePageTransition>
        <ConciergeMoment moment="dealerFound" />
      </FadePageTransition>
    </ModifyNoChargesGatedPage>
  );
}
