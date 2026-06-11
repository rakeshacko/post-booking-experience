import { ConciergeMoment } from "@/components/concierge/ConciergeMoment";
import { FadePageTransition } from "@/components/ui/page-transition";

/**
 * Arrival — the price-lock payment landed and Shivi takes over.
 * Replaces the old payment-success → buying-guide → KYC chain with one turn.
 */
export default function ArrivalPage() {
  return (
    <FadePageTransition>
      <ConciergeMoment moment="arrival" />
    </FadePageTransition>
  );
}
