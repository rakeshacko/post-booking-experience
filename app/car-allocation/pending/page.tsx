import { CarAllocationPendingPageClient } from "@/components/kyc/CarAllocationPendingPageClient";
import { ModifyNoChargesGatedPage } from "@/components/kyc/ModifyNoChargesGatedPage";

/**
 * After booking celebration “Okay” — same shell as `/kyc/processing`; Next → allocation confirmed.
 */
export default function CarAllocationPendingPage() {
  return (
    <ModifyNoChargesGatedPage>
      <CarAllocationPendingPageClient />
    </ModifyNoChargesGatedPage>
  );
}
