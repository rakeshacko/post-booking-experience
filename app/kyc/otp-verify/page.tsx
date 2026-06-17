import { ConciergeOtpScreen } from "@/components/concierge/ConciergeOtpScreen";
import { ModifyNoChargesGatedPage } from "@/components/kyc/ModifyNoChargesGatedPage";
import { FadePageTransition } from "@/components/ui/page-transition";

/**
 * On-screen OTP — AckoDrive-only path. Heads-up then code entry; replaces the
 * dealer's confirmation call. Reached from the dealer-found turn when the
 * dealer is hidden.
 */
export default function KycOtpVerifyPage() {
  return (
    <ModifyNoChargesGatedPage>
      <FadePageTransition>
        <ConciergeOtpScreen />
      </FadePageTransition>
    </ModifyNoChargesGatedPage>
  );
}
