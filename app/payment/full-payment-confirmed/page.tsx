import { FullPaymentConfirmedScreen } from "@/components/payment/FullPaymentConfirmedScreen";
import { FadePageTransition } from "@/components/ui/page-transition";

/**
 * Full payment — payment option confirmed. Fade entry (no slide-from-bottom) so the hero Lottie
 * stays visually stable; in-screen sequence is handled inside the screen component.
 */
export default function FullPaymentConfirmedPage() {
  return (
    <FadePageTransition>
      <FullPaymentConfirmedScreen />
    </FadePageTransition>
  );
}
