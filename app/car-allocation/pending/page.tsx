import { ConciergeMoment } from "@/components/concierge/ConciergeMoment";
import { ModifyNoChargesGatedPage } from "@/components/kyc/ModifyNoChargesGatedPage";

/**
 * Exact-unit assignment underway — Shivi pushes the dealer for fresh stock.
 */
export default function CarAllocationPendingPage() {
  return (
    <ModifyNoChargesGatedPage>
      <ConciergeMoment moment="allocationPending" />
    </ModifyNoChargesGatedPage>
  );
}
