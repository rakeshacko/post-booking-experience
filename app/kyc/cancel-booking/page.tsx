import { CancelBookingConfirmScreen } from "@/components/kyc/CancelBookingConfirmScreen";
import { CancelBookingFlowGuard } from "@/components/kyc/CancelBookingFlowGuard";

/**
 * Cancel booking confirmation — cancel-no-charges demo flow only.
 */
export default function CancelBookingPage() {
  return (
    <CancelBookingFlowGuard>
      <CancelBookingConfirmScreen />
    </CancelBookingFlowGuard>
  );
}
