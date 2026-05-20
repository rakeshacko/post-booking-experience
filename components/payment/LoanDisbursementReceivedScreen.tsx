"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

import { DEMO_DEFAULT_LOAN_DISBURSEMENT_INR } from "@/components/payment/loan-amount-demo-constants";
import { PAYMENT_SUCCESS_ACK_ASSETS } from "@/components/payment/payment-success-ack-assets";
import { SUCCESS_SCREEN_HEADLINE_SUBTEXT_GAP_CLASS } from "@/components/ui/success-screen-layout";

const HEADLINE = "Loan disbursed!";
const SUBLINE =
  "The bank has sent the full loan amount to the dealer. Your car is now being prepped for delivery.";

/** After illustration, delay before header + subtext (step 2). */
const HEADER_AFTER_ILLUSTRATION_MS = 420;
/** After header, delay before disbursed amount card (step 3). */
const AMOUNT_AFTER_HEADER_MS = 420;
/** After amount card, delay before bottom CTA (step 4). */
const CTA_AFTER_AMOUNT_MS = 420;
/** If illustration `onLoadingComplete` never fires, still reveal art + copy. */
const ILLUSTRATION_FALLBACK_MS = 1200;

const FADE_TRANSITION = { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const };

/** Reserved height so header fade-in does not shift layout. */
const HEADER_SLOT_MIN_HEIGHT_CLASS = "min-h-[96px]";
/** Reserved height for disbursed amount card slot. */
const AMOUNT_SLOT_MIN_HEIGHT_CLASS = "min-h-[52px]";

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(amount)));
}

function parseLoanAmountInr(raw: string | null): number {
  if (raw == null || raw === "") return DEMO_DEFAULT_LOAN_DISBURSEMENT_INR;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return DEMO_DEFAULT_LOAN_DISBURSEMENT_INR;
  return Math.round(n);
}

type LoanDisbursementReceivedScreenProps = {
  /** Primary CTA destination (defaults to insurance prep). */
  okayHref?: string;
};

/**
 * Loan disbursement acknowledged — success layout (same shell as documents received).
 * Load order: illustration → header + subtext → disbursed amount → CTA.
 * Slots are always mounted with reserved height so nothing shifts vertically.
 */
export function LoanDisbursementReceivedScreen({
  okayHref = "/payment/car-delivery-insurance-prep",
}: LoanDisbursementReceivedScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const headerRevealedByIllustrationRef = useRef(false);
  const [showIllustration, setShowIllustration] = useState(false);
  const [showHeader, setShowHeader] = useState(false);
  const [showAmount, setShowAmount] = useState(false);
  const [showFooter, setShowFooter] = useState(false);

  const disbursedAmountInr = useMemo(
    () => parseLoanAmountInr(searchParams.get("loan_amount")),
    [searchParams],
  );

  const revealHeader = useCallback(() => {
    headerRevealedByIllustrationRef.current = true;
    setShowHeader(true);
  }, []);

  const onIllustrationLoaded = useCallback(() => {
    setShowIllustration(true);
    window.setTimeout(revealHeader, HEADER_AFTER_ILLUSTRATION_MS);
  }, [revealHeader]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (!headerRevealedByIllustrationRef.current) {
        setShowIllustration(true);
        revealHeader();
      }
    }, ILLUSTRATION_FALLBACK_MS);
    return () => window.clearTimeout(id);
  }, [revealHeader]);

  useEffect(() => {
    if (!showHeader) return;
    const id = window.setTimeout(() => setShowAmount(true), AMOUNT_AFTER_HEADER_MS);
    return () => window.clearTimeout(id);
  }, [showHeader]);

  useEffect(() => {
    if (!showAmount) return;
    const id = window.setTimeout(() => setShowFooter(true), CTA_AFTER_AMOUNT_MS);
    return () => window.clearTimeout(id);
  }, [showAmount]);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#fafbfb] font-sans shadow-[0_-4px_8px_-2px_rgba(54,53,76,0.06)]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[50%] bg-gradient-to-b from-[#e8f8ef]/90 via-[#f4fbf7]/40 to-transparent transition-opacity duration-700"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-dvh w-full flex-col justify-start px-5 pb-[calc(48px+max(20px,env(safe-area-inset-bottom)))] pt-[calc(48px+clamp(4rem,14vh,6.5rem))]">
        <main className="mx-auto flex w-full max-w-[640px] flex-col items-center gap-4 text-center">
          <motion.div
            animate={{ opacity: showIllustration ? 1 : 0 }}
            transition={FADE_TRANSITION}
            className={`relative mx-auto h-[104px] w-[104px] shrink-0 ${showIllustration ? "" : "pointer-events-none"}`}
            aria-hidden={!showIllustration}
          >
            <Image
              src={PAYMENT_SUCCESS_ACK_ASSETS.loanDisbursedIllustration}
              alt=""
              width={104}
              height={104}
              className="h-[104px] w-[104px] object-contain"
              unoptimized
              priority
              onLoadingComplete={onIllustrationLoaded}
            />
          </motion.div>

          <motion.div
            animate={{ opacity: showHeader ? 1 : 0 }}
            transition={FADE_TRANSITION}
            className={`flex w-full flex-col items-center text-center ${SUCCESS_SCREEN_HEADLINE_SUBTEXT_GAP_CLASS} ${HEADER_SLOT_MIN_HEIGHT_CLASS} ${
              showHeader ? "" : "pointer-events-none"
            }`}
            aria-hidden={!showHeader}
          >
            <h1 className="w-full text-[24px] font-semibold leading-8 tracking-[-0.1px] text-[#121212]">
              {HEADLINE}
            </h1>
            <p className="w-full text-sm font-normal leading-5 text-[#4b4b4b]">{SUBLINE}</p>
          </motion.div>

          <motion.section
            animate={{ opacity: showAmount ? 1 : 0 }}
            transition={FADE_TRANSITION}
            className={`w-full ${AMOUNT_SLOT_MIN_HEIGHT_CLASS} ${showAmount ? "" : "pointer-events-none"}`}
            aria-hidden={!showAmount}
            aria-label="Disbursed amount summary"
          >
            <div className="w-full rounded-xl border border-[#e8e8e8] bg-white px-4 py-3 text-left">
              <dl className="m-0 flex items-center justify-between gap-3">
                <dt className="text-sm font-normal leading-5 text-[#4b4b4b]">Disbursed amount</dt>
                <dd className="text-base font-semibold leading-6 text-[#121212]">
                  {formatInr(disbursedAmountInr)}
                </dd>
              </dl>
            </div>
          </motion.section>
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 px-5 pb-[max(20px,env(safe-area-inset-bottom))]">
        <motion.div
          animate={{ opacity: showFooter ? 1 : 0 }}
          transition={FADE_TRANSITION}
          className={`mx-auto w-full max-w-[640px] ${showFooter ? "" : "pointer-events-none"}`}
        >
          <button
            type="button"
            className="primary-cta w-full focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/30 focus-visible:ring-offset-2"
            tabIndex={showFooter ? 0 : -1}
            aria-hidden={!showFooter}
            onClick={() => router.push(okayHref)}
          >
            Okay
          </button>
        </motion.div>
      </div>
    </div>
  );
}
