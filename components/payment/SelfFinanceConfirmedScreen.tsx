"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";

import ackoDriveFinanceSuccessLottie from "@/components/kyc/lottie/acko-drive-finance-success.json";
import { SUCCESS_SCREEN_HEADLINE_SUBTEXT_GAP_CLASS } from "@/components/ui/success-screen-layout";

/** After header + subtext mount, delay before showing the bottom CTA (reads as step 3). */
const CTA_AFTER_HEADER_MS = 420;
/** If Lottie `onComplete` never fires, still reveal copy so the user is not stuck. */
const HEADER_FALLBACK_MS = 2200;

/**
 * Self finance — payment option confirmed. Sequence: Lottie completes → header + subtext → CTA.
 */
export function SelfFinanceConfirmedScreen() {
  const router = useRouter();
  const headerRevealedByLottieRef = useRef(false);
  const [showHeader, setShowHeader] = useState(false);
  const [showFooter, setShowFooter] = useState(false);

  const revealHeader = useCallback(() => {
    headerRevealedByLottieRef.current = true;
    setShowHeader(true);
  }, []);

  const onLottieComplete = useCallback(() => {
    revealHeader();
  }, [revealHeader]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (!headerRevealedByLottieRef.current) {
        revealHeader();
      }
    }, HEADER_FALLBACK_MS);
    return () => window.clearTimeout(id);
  }, [revealHeader]);

  useEffect(() => {
    if (!showHeader) return;
    const id = window.setTimeout(() => setShowFooter(true), CTA_AFTER_HEADER_MS);
    return () => window.clearTimeout(id);
  }, [showHeader]);

  const onContinue = useCallback(() => {
    router.push("/payment/self-finance-action");
  }, [router]);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#fafbfb] font-sans shadow-[0_-4px_8px_-2px_rgba(54,53,76,0.06)]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[50%] bg-gradient-to-b from-[#e8f8ef]/90 via-[#f4fbf7]/40 to-transparent transition-opacity duration-700"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-dvh w-full flex-col justify-start px-4 pb-[max(5.5rem,env(safe-area-inset-bottom))] pt-[calc(48px+clamp(4rem,14vh,6.5rem))]">
        <main className="mx-auto flex w-full flex-col items-center overflow-y-auto text-center">
          <div className="relative flex h-[96px] w-[96px] shrink-0 items-center justify-center">
            <Lottie
              animationData={ackoDriveFinanceSuccessLottie}
              loop={false}
              className="h-full w-full"
              aria-label="Success animation"
              onComplete={onLottieComplete}
            />
          </div>

          {showHeader && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className={`mt-5 flex w-full flex-col items-center ${SUCCESS_SCREEN_HEADLINE_SUBTEXT_GAP_CLASS}`}
            >
              <h1 className="text-center text-2xl font-semibold leading-8 tracking-[-0.1px] text-[#121212]">
                <span className="block">You&apos;re proceeding with</span>
                <span className="block">Self finance</span>
              </h1>
              <p className="w-full text-center text-sm font-normal leading-5 text-[#4b4b4b]">
                Arrange the loan with your bank your way. We&apos;ll guide you through documents
              </p>
            </motion.div>
          )}
        </main>
      </div>

      {showFooter && (
        <div className="fixed inset-x-0 bottom-0 z-20 bg-white pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-4px_6px_0_rgba(54,53,76,0.08)]">
          <div className="mx-auto flex w-full max-w-[640px] items-start justify-center px-5 pt-3">
            <button
              type="button"
              className="primary-cta w-full rounded-lg focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/30 focus-visible:ring-offset-2"
              onClick={onContinue}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
