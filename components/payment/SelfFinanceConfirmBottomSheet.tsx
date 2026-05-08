"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { PAYMENT_CHOOSE_ASSETS } from "@/components/payment/payment-choose-assets";

/** Enter/exit slide duration — keep in sync with `BankSelectionBottomSheet` */
const SHEET_TRANSITION_MS = 280;

const SHEET_ASSETS = {
  bullet: "/assets/tick.svg",
} as const;

const BEFORE_YOU_PROCEED_POINTS: readonly ReactNode[] = [
  <>
    You&apos;ll arrange the loan directly with your bank — we&apos;re not involved in that part
  </>,
  <>
    We&apos;ll give you the documents your bank needs — you&apos;ll share them with your bank at the
    right time
  </>,
  <>
    You&apos;ll pay the down payment to us — we&apos;ll hold it safely and pass it to the dealer
  </>,
  <>
    Once your bank releases the loan, you&apos;ll share a confirmation with us — that&apos;s the last
    step before delivery
  </>,
];

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="block h-6 w-6" aria-hidden>
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type SelfFinanceConfirmBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

/**
 * Self finance — confirm before navigating to payment. Behaviour aligned with
 * {@link BankSelectionBottomSheet} / {@link LoanSubmitConfirmBottomSheet}.
 */
export function SelfFinanceConfirmBottomSheet({
  open,
  onClose,
  onConfirm,
}: SelfFinanceConfirmBottomSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    if (exitTimeoutRef.current) {
      clearTimeout(exitTimeoutRef.current);
      exitTimeoutRef.current = null;
    }
    setMounted(true);
    setAnimateIn(false);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimateIn(true));
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (open || !mounted) return;
    setAnimateIn(false);
    exitTimeoutRef.current = setTimeout(() => {
      exitTimeoutRef.current = null;
      setMounted(false);
    }, SHEET_TRANSITION_MS);
    return () => {
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
        exitTimeoutRef.current = null;
      }
    };
  }, [open, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  const handleConfirm = useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        className={`absolute inset-0 bg-black/90 transition-opacity duration-[280ms] ease-out motion-reduce:opacity-100 motion-reduce:transition-none ${
          animateIn ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-label="Dismiss"
      />
      <div
        className={`absolute bottom-0 left-1/2 z-10 flex max-h-[90dvh] w-full max-w-[360px] -translate-x-1/2 flex-col overflow-hidden rounded-t-[24px] bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-transform duration-[280ms] ease-out motion-reduce:translate-y-0 motion-reduce:transition-none ${
          animateIn ? "translate-y-0" : "translate-y-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="self-finance-things-to-know-title"
        aria-describedby="self-finance-before-proceed-list"
      >
        <div className="relative flex min-h-0 flex-1 flex-col">
          <button
            type="button"
            onClick={onClose}
            className="cta-ghost absolute right-5 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-lg text-[#121212] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/20 focus-visible:ring-offset-2"
            aria-label="Close"
          >
            <CloseIcon />
          </button>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-6">
            <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden bg-white" aria-hidden>
              <Image
                src={PAYMENT_CHOOSE_ASSETS.selfFinance}
                alt=""
                width={72}
                height={72}
                className="h-[72px] w-[72px] object-contain"
                unoptimized
                sizes="72px"
              />
            </div>

            <h2
              id="self-finance-things-to-know-title"
              className="mt-4 w-full pr-12 text-left text-[20px] font-semibold leading-[1.35] tracking-[-0.1px] text-[#121212]"
            >
              Things to know before you continue!
            </h2>

            <ul
              id="self-finance-before-proceed-list"
              className="mt-4 w-full list-none space-y-[12px] rounded-2xl bg-[#f5f5f5] p-4"
            >
              {BEFORE_YOU_PROCEED_POINTS.map((line, index) => (
                <li key={index} className="flex gap-2">
                  <span className="relative mt-0.5 h-5 w-5 shrink-0" aria-hidden>
                    <Image
                      src={SHEET_ASSETS.bullet}
                      alt=""
                      width={20}
                      height={20}
                      className="h-5 w-5 object-contain"
                      unoptimized
                      sizes="20px"
                    />
                  </span>
                  <p className="min-w-0 flex-1 text-left text-xs font-normal leading-[18px] text-[#121212]">
                    {line}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="shrink-0 bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
            <button type="button" onClick={handleConfirm} className="primary-cta w-full">
              Agree and continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
