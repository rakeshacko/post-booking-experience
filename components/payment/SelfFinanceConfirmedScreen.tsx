"use client";

import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import ackoDriveFinanceSuccessLottie from "@/components/kyc/lottie/acko-drive-finance-success.json";
import { useReducedMotion } from "@/lib/animations/utils";

const USER_NAME = "Sharath";

const HEADLINE = `You're financing your own way, ${USER_NAME}`;
const SUBLINE =
  "Arrange the loan with your bank. We will provide all the documents your bank needs.";

/** If Lottie `onComplete` never fires, still reveal copy so the user is not stuck. */
const HEADER_FALLBACK_MS = 2200;
/** After copy mounts, delay before showing the bottom CTA (reads as step 3). */
const CTA_AFTER_COPY_MS = 420;

const FADE_DURATION = 0.45;
const FADE_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Self finance — payment option confirmed. Sequence: Lottie → headline + subtext → CTA.
 * Copy and footer stay in the DOM from first paint (opacity only) to avoid layout shift.
 */
export function SelfFinanceConfirmedScreen() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const copyRevealedByLottieRef = useRef(false);
  const [showCopy, setShowCopy] = useState(prefersReducedMotion);
  const [showFooter, setShowFooter] = useState(prefersReducedMotion);

  const revealCopy = useCallback(() => {
    copyRevealedByLottieRef.current = true;
    setShowCopy(true);
  }, []);

  const onLottieComplete = useCallback(() => {
    revealCopy();
  }, [revealCopy]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = window.setTimeout(() => {
      if (!copyRevealedByLottieRef.current) {
        revealCopy();
      }
    }, HEADER_FALLBACK_MS);
    return () => window.clearTimeout(id);
  }, [prefersReducedMotion, revealCopy]);

  useEffect(() => {
    if (!showCopy || prefersReducedMotion) return;
    const id = window.setTimeout(() => setShowFooter(true), CTA_AFTER_COPY_MS);
    return () => window.clearTimeout(id);
  }, [showCopy, prefersReducedMotion]);

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-[#fafbfb] font-sans">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[50%] bg-gradient-to-b from-[#e8f8ef]/90 via-[#f4fbf7]/40 to-transparent"
        aria-hidden
      />

      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-5">
        <div className="-translate-y-8 flex w-full max-w-[640px] flex-col items-center text-center">
          <div className="relative flex h-[104px] w-[104px] shrink-0 items-center justify-center">
            <Lottie
              animationData={ackoDriveFinanceSuccessLottie}
              loop={false}
              className="h-full w-full"
              aria-label="Success animation"
              onComplete={onLottieComplete}
            />
          </div>

          <motion.div
            className="mt-6 flex w-full flex-col items-center gap-3"
            initial={false}
            animate={{ opacity: showCopy ? 1 : 0 }}
            transition={{ duration: FADE_DURATION, ease: FADE_EASE }}
            aria-hidden={!showCopy}
          >
            <h1 className="text-center text-[24px] font-semibold leading-8 tracking-[-0.1px] text-[#121212]">
              {HEADLINE}
            </h1>
            <p className="max-w-sm text-sm font-normal leading-5 text-[#4b4b4b]">{SUBLINE}</p>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="relative z-10 shrink-0 bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_6px_0_rgba(54,53,76,0.08)]"
        initial={false}
        animate={{ opacity: showFooter ? 1 : 0 }}
        transition={{ duration: FADE_DURATION, ease: FADE_EASE }}
        style={{ pointerEvents: showFooter ? "auto" : "none" }}
        aria-hidden={!showFooter}
      >
        <button
          type="button"
          className="primary-cta w-full focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/30 focus-visible:ring-offset-2"
          onClick={() => router.push("/payment/self-finance-action")}
          tabIndex={showFooter ? 0 : -1}
        >
          Continue
        </button>
      </motion.div>
    </div>
  );
}
