import { ChooseModifyBookingScreen } from "@/components/kyc/ChooseModifyBookingScreen";
import { ModifySelectionFlowGuard } from "@/components/kyc/ModifySelectionFlowGuard";

/**
 * Manage booking → Change selection — pick colour, variant, or different car.
 * Only active in the modify-no-charges experience flow.
 */
export default function ModifySelectionPage() {
  return (
    <ModifySelectionFlowGuard>
      <ChooseModifyBookingScreen />
    </ModifySelectionFlowGuard>
  );
}
