import { ModifySelectionFlowGuard } from "@/components/kyc/ModifySelectionFlowGuard";
import { ModifySelectionReviewPayScreen } from "@/components/kyc/ModifySelectionReviewPayScreen";

/**
 * Change colour — review selection and pay booking amount delta.
 */
export default function ModifySelectionColourConfirmPage() {
  return (
    <ModifySelectionFlowGuard>
      <ModifySelectionReviewPayScreen flow="colour" />
    </ModifySelectionFlowGuard>
  );
}
