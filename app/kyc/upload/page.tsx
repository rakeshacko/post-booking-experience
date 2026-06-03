import { KycDocumentUploadScreen } from "@/components/kyc/KycDocumentUploadScreen";
import { FadePageTransition } from "@/components/ui/page-transition";

/**
 * KYC document upload — Figma nodes 2501:8136, 2502:8777, 2502:8901.
 */
export default function KycUploadPage() {
  return (
    <FadePageTransition>
      <KycDocumentUploadScreen />
    </FadePageTransition>
  );
}
