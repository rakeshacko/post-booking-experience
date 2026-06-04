import { KycDocumentsReceivedScreen } from "@/components/kyc/KycDocumentsReceivedScreen";
import { ModifyNoChargesGatedPage } from "@/components/kyc/ModifyNoChargesGatedPage";

/**
 * KYC — documents submitted success (Figma node 1880:6801).
 */
export default function KycDocumentsReceivedPage() {
  return (
    <ModifyNoChargesGatedPage>
      <KycDocumentsReceivedScreen />
    </ModifyNoChargesGatedPage>
  );
}
