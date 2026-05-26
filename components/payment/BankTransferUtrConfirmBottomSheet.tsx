"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";

import { PAYMENT_CHOOSE_ASSETS } from "@/components/payment/payment-choose-assets";
import {
  BOTTOM_SHEET_BODY_BEFORE_CTA_CLASS,
  BOTTOM_SHEET_CTA_STRIP_TOP_CLASS,
  BOTTOM_SHEET_MAX_HEIGHT_CLASS,
} from "@/components/ui/bottom-sheet-layout";
import { bottomSheetTitleWidthWithIllustration } from "@/components/ui/bottom-sheet-title-layout";
import { BottomSheetCloseIcon } from "@/components/ui/BottomSheetCloseIcon";

const SHEET_TRANSITION_MS = 280;

const MAX_UTR_LEN = 50;

type BankTransferUtrConfirmBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  /** Called after the user confirms with a non-empty UTR (whitespace stripped from input). */
  onConfirm: (utr: string) => void;
};

/**
 * Self finance — user confirms bank transfer by entering a UTR for verification.
 */
export function BankTransferUtrConfirmBottomSheet({
  open,
  onClose,
  onConfirm,
}: BankTransferUtrConfirmBottomSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [utr, setUtr] = useState("");
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
    if (!open) return;
    setUtr("");
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

  const onUtrChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value.replace(/\s/g, "").slice(0, MAX_UTR_LEN);
    setUtr(next);
  }, []);

  const handleConfirm = useCallback(() => {
    if (utr === "") return;
    onConfirm(utr);
  }, [onConfirm, utr]);

  const primaryDisabled = utr.length === 0;

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
        className={`absolute bottom-0 left-1/2 z-10 flex ${BOTTOM_SHEET_MAX_HEIGHT_CLASS} w-full max-w-[640px] -translate-x-1/2 flex-col overflow-hidden rounded-t-[20px] bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-transform duration-[280ms] ease-out motion-reduce:translate-y-0 motion-reduce:transition-none ${
          animateIn ? "translate-y-0" : "translate-y-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bank-transfer-confirm-title"
        aria-describedby="bank-transfer-confirm-body"
      >
        <div className="relative flex min-h-0 flex-1 flex-col">
          <button
            type="button"
            onClick={onClose}
            className="cta-ghost absolute right-5 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-lg text-[#121212] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/20 focus-visible:ring-offset-2"
            aria-label="Close"
          >
            <BottomSheetCloseIcon />
          </button>

          <div className={`min-h-0 flex-1 overflow-y-auto px-5 pt-6 ${BOTTOM_SHEET_BODY_BEFORE_CTA_CLASS}`}>
            <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden bg-white" aria-hidden>
              <Image
                src={PAYMENT_CHOOSE_ASSETS.loanApproved}
                alt=""
                width={72}
                height={72}
                className="h-[72px] w-[72px] object-contain"
                unoptimized
                sizes="72px"
              />
            </div>
            <h2
              id="bank-transfer-confirm-title"
              className={`mt-[24px] ${bottomSheetTitleWidthWithIllustration} text-left text-[20px] font-semibold leading-[28px] tracking-[-0.12px] text-[#121212]`}
            >
              Confirm bank transfer
            </h2>
            <p
              id="bank-transfer-confirm-body"
              className="mt-3 w-full text-left text-sm font-normal leading-[22px] text-[#4b4b4b]"
            >
              Let us know once your bank has transferred the loan amount to the dealer. Adding your UTR
              number helps us verify the transfer faster.
            </p>

            <div className="mt-6 w-full">
              <label htmlFor="bank-transfer-utr-input" className="sr-only">
                UTR number
              </label>
              <div className="flex h-12 min-h-12 w-full items-center rounded-lg border border-[#e8e8e8] bg-white px-4">
                <input
                  id="bank-transfer-utr-input"
                  type="text"
                  autoComplete="off"
                  value={utr}
                  onChange={onUtrChange}
                  placeholder="Enter UTR number"
                  maxLength={MAX_UTR_LEN}
                  className="min-w-0 w-full border-0 bg-transparent p-0 text-[16px] font-normal leading-[22px] text-[#121212] outline-none placeholder:text-[#9e9e9e] focus:ring-0"
                />
              </div>
            </div>
          </div>

          <div
            className={`shrink-0 space-y-3 bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] ${BOTTOM_SHEET_CTA_STRIP_TOP_CLASS}`}
          >
            <button
              type="button"
              onClick={handleConfirm}
              disabled={primaryDisabled}
              className="primary-cta w-full disabled:pointer-events-none disabled:opacity-50"
            >
              Confirm transfer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
