"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

import loanApprovedIllustration from "@/assets/loan approved.svg";
import {
  DEMO_DEFAULT_LOAN_DISBURSEMENT_INR,
  DEMO_LOAN_DISBURSEMENT_TRANSACTION_ID,
} from "@/components/payment/loan-amount-demo-constants";
import { SUCCESS_SCREEN_HEADLINE_SUBTEXT_GAP_CLASS } from "@/components/ui/success-screen-layout";
import { buildPayInsurancePremiumHref } from "@/lib/paymentUrls";

const HEADLINE = "Loan disbursed, Sharath!";
const SUBLINE =
  "The bank has sent the full loan amount to the dealer. Your car is now being prepped for delivery.";

/** After header + subtext, delay before disbursed amount card (step 3). */
const CARD_AFTER_HEADER_MS = 420;
/** After amount card, delay before bottom CTA (step 4). */
const CTA_AFTER_CARD_MS = 420;
/** If hero art never loads, still reveal copy so the user is not stuck. */
const HEADER_FALLBACK_MS = 2200;

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
  /** Primary CTA destination (defaults to pay insurance premium). */
  okayHref?: string;
};

/**
 * Loan disbursement acknowledged — same load sequence and CTA chrome as
 * {@link SelfFinanceConfirmedScreen} / {@link FullPaymentConfirmedScreen}.
 * Sequence: hero illustration → header + subtext → disbursed amount → Continue.
 */
export function LoanDisbursementReceivedScreen({
  okayHref: okayHrefProp,
}: LoanDisbursementReceivedScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const headerRevealedByHeroRef = useRef(false);
  const [showHeader, setShowHeader] = useState(false);
  const [showAmountCard, setShowAmountCard] = useState(false);
  const [showFooter, setShowFooter] = useState(false);

  const okayHref = useMemo(
    () =>
      okayHrefProp ??
      buildPayInsurancePremiumHref({
        bank: searchParams.get("bank"),
        loanAmount: searchParams.get("loan_amount"),
      }),
    [okayHrefProp, searchParams],
  );

  const disbursedAmountInr = useMemo(
    () => parseLoanAmountInr(searchParams.get("loan_amount")),
    [searchParams],
  );

  const transactionId = useMemo(() => {
    const fromUrl = searchParams.get("transaction_id")?.trim();
    return fromUrl && fromUrl.length > 0
      ? fromUrl
      : DEMO_LOAN_DISBURSEMENT_TRANSACTION_ID;
  }, [searchParams]);

  const revealHeader = useCallback(() => {
    headerRevealedByHeroRef.current = true;
    setShowHeader(true);
  }, []);

  const onHeroLoaded = useCallback(() => {
    revealHeader();
  }, [revealHeader]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (!headerRevealedByHeroRef.current) {
        revealHeader();
      }
    }, HEADER_FALLBACK_MS);
    return () => window.clearTimeout(id);
  }, [revealHeader]);

  useEffect(() => {
    if (!showHeader) return;
    const id = window.setTimeout(() => setShowAmountCard(true), CARD_AFTER_HEADER_MS);
    return () => window.clearTimeout(id);
  }, [showHeader]);

  useEffect(() => {
    if (!showAmountCard) return;
    const id = window.setTimeout(() => setShowFooter(true), CTA_AFTER_CARD_MS);
    return () => window.clearTimeout(id);
  }, [showAmountCard]);

  const onContinue = useCallback(() => {
    router.push(okayHref);
  }, [okayHref, router]);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#fafbfb] font-sans shadow-[0_-4px_8px_-2px_rgba(54,53,76,0.06)]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[50%] bg-gradient-to-b from-[#e8f8ef]/90 via-[#f4fbf7]/40 to-transparent transition-opacity duration-700"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-dvh w-full flex-col justify-start px-4 pb-[max(5.5rem,env(safe-area-inset-bottom))] pt-[calc(48px+clamp(4rem,14vh,6.5rem))]">
        <main className="mx-auto flex w-full max-w-[640px] flex-col items-center overflow-y-auto text-center">
          <div className="relative flex h-[96px] w-[96px] shrink-0 items-center justify-center">
            <Image
              src={loanApprovedIllustration}
              alt=""
              width={96}
              height={96}
              className="h-full w-full object-contain"
              unoptimized
              priority
              onLoadingComplete={onHeroLoaded}
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
                {HEADLINE}
              </h1>
              <p className="w-full text-center text-sm font-normal leading-5 text-[#4b4b4b]">
                {SUBLINE}
              </p>
            </motion.div>
          )}

          {showAmountCard && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 w-full"
              aria-label="Disbursed amount summary"
            >
              <div className="w-full rounded-xl border border-[#e8e8e8] bg-white px-4 py-3 text-left">
                <dl className="m-0 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-sm font-normal leading-5 text-[#4b4b4b]">Disbursed amount</dt>
                    <dd className="text-right text-sm font-medium leading-5 text-[#121212]">
                      {formatInr(disbursedAmountInr)}
                    </dd>
                  </div>
                  <hr className="my-0 border-0 border-t border-dashed border-[#e8e8e8]" />
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-sm font-normal leading-5 text-[#4b4b4b]">Transaction ID</dt>
                    <dd className="break-all text-right text-sm font-medium leading-5 text-[#121212]">
                      {transactionId}
                    </dd>
                  </div>
                </dl>
              </div>
            </motion.section>
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
