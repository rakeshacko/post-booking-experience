import { ConciergeAllocationFailedScreen } from "@/components/concierge/ConciergeAllocationFailedScreen";
import { ModifyNoChargesGatedPage } from "@/components/kyc/ModifyNoChargesGatedPage";

/**
 * Allocation failed (demo branch) — ACKO couldn't source the exact car;
 * policy §1.14 remediation: full refund, standard timeline, or free change.
 */
export default function CarAllocationFailedPage() {
  return (
    <ModifyNoChargesGatedPage>
      <ConciergeAllocationFailedScreen />
    </ModifyNoChargesGatedPage>
  );
}
