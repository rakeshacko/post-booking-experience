import { ConciergeMoment } from "@/components/concierge/ConciergeMoment";
import { ModifyNoChargesGatedPage } from "@/components/kyc/ModifyNoChargesGatedPage";
import { FadePageTransition } from "@/components/ui/page-transition";

/**
 * Dealer search — verified; Shivi is out finding the exact car.
 */
export default function KycProcessingPage() {
  return (
    <ModifyNoChargesGatedPage>
      <FadePageTransition>
        <ConciergeMoment moment="dealerSearch" />
      </FadePageTransition>
    </ModifyNoChargesGatedPage>
  );
}
