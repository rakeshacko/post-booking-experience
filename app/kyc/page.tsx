import { ConciergeVerifyIdentityScreen } from "@/components/concierge/ConciergeVerifyIdentityScreen";

/**
 * Identity turn — Shivi asks for PAN + Aadhaar and collects them inline.
 * (Shivi is introduced on arrival at `/payment/booking-success`.)
 */
export default function KycPage() {
  return <ConciergeVerifyIdentityScreen />;
}
