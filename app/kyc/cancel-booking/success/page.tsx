import { CancelBookingFlowGuard } from "@/components/kyc/CancelBookingFlowGuard";
import { CancelBookingSuccessScreen } from "@/components/kyc/CancelBookingSuccessScreen";

/**
 * Cancel booking success — cancel-no-charges demo flow only.
 */
export default function CancelBookingSuccessPage() {
  return (
    <CancelBookingFlowGuard>
      <CancelBookingSuccessScreen />
    </CancelBookingFlowGuard>
  );
}
