import { ModifySelectionVariantColourScreen } from "@/components/kyc/ModifySelectionVariantColourScreen";
import { ModifySelectionFlowGuard } from "@/components/kyc/ModifySelectionFlowGuard";

/**
 * Change variant — pick colour for the selected variant (hero car card + colour cards).
 */
export default function ModifySelectionVariantColourPage() {
  return (
    <ModifySelectionFlowGuard>
      <ModifySelectionVariantColourScreen />
    </ModifySelectionFlowGuard>
  );
}
