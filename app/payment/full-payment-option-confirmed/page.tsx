import { Suspense } from "react";

import { FullPaymentOptionConfirmedScreen } from "@/components/payment/FullPaymentOptionConfirmedScreen";
import { CelebrationPageTransition } from "@/components/ui/page-transition";

/**
 * Full payment — success celebration after confirm sheet; auto-advances to action screen.
 */
export default function FullPaymentOptionConfirmedPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-white" aria-hidden />}>
      <CelebrationPageTransition>
        <FullPaymentOptionConfirmedScreen />
      </CelebrationPageTransition>
    </Suspense>
  );
}
