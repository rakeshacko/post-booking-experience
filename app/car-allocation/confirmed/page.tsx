import { CarAllocationConfirmedScreen } from "@/components/kyc/CarAllocationConfirmedScreen";
import { ModifyNoChargesGatedPage } from "@/components/kyc/ModifyNoChargesGatedPage";

/**
 * After `/car-allocation/pending` Next — celebration + car card; Okay → `/payment/default`.
 */
export default function CarAllocationConfirmedPage() {
  return (
    <ModifyNoChargesGatedPage>
      <CarAllocationConfirmedScreen />
    </ModifyNoChargesGatedPage>
  );
}
