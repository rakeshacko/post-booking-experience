import { ConciergeMoment } from "@/components/concierge/ConciergeMoment";
import { ModifyNoChargesGatedPage } from "@/components/kyc/ModifyNoChargesGatedPage";

/**
 * Exact unit assigned — engine + chassis in the user's name.
 */
export default function CarAllocationConfirmedPage() {
  return (
    <ModifyNoChargesGatedPage>
      <ConciergeMoment moment="allocationDone" />
    </ModifyNoChargesGatedPage>
  );
}
