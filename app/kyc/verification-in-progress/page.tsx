import { ConciergeMoment } from "@/components/concierge/ConciergeMoment";
import { ModifyNoChargesGatedPage } from "@/components/kyc/ModifyNoChargesGatedPage";

/**
 * Verification underway — Shivi watches the queue; over-days waiting turn.
 * Time-skip routes to `/kyc/processing` (express) or verification-failed
 * (kyc_failed flow); hidden entirely in cancel_no_charges.
 */
export default function KycVerificationInProgressPage() {
  return (
    <ModifyNoChargesGatedPage>
      <ConciergeMoment moment="verificationInProgress" />
    </ModifyNoChargesGatedPage>
  );
}
