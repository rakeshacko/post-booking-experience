import { SelfFinanceConfirmedScreen } from "@/components/payment/SelfFinanceConfirmedScreen";
import { FadePageTransition } from "@/components/ui/page-transition";

/**
 * Self finance — payment option confirmed. Fade entry (no slide-from-bottom) so the hero Lottie
 * stays visually stable; in-screen sequence is handled inside the screen component.
 */
export default function SelfFinanceConfirmedPage() {
  return (
    <FadePageTransition>
      <SelfFinanceConfirmedScreen />
    </FadePageTransition>
  );
}
