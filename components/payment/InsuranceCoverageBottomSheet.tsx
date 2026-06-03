"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  INSURANCE_COVERAGE_ITEMS,
  INSURANCE_COVERAGE_SHEET_TITLE,
  type InsuranceCoverageItem,
} from "@/components/payment/insurance-coverage-content";
import { BottomSheetCloseIcon } from "@/components/ui/BottomSheetCloseIcon";
import { BottomSheetPortal } from "@/components/ui/BottomSheetPortal";
import {
  BOTTOM_SHEET_BODY_BEFORE_CTA_CLASS,
  BOTTOM_SHEET_CTA_STRIP_TOP_CLASS,
  BOTTOM_SHEET_MAX_HEIGHT_CLASS,
} from "@/components/ui/bottom-sheet-layout";

/** Enter/exit slide duration — keep in sync with `LoanSubmitConfirmBottomSheet` */
const SHEET_TRANSITION_MS = 280;

function CoverageDetailRow({ iconSrc, durationLabel, planTitle, description }: InsuranceCoverageItem) {
  return (
    <div className="flex gap-3">
      <div className="relative size-16 shrink-0" aria-hidden>
        <Image
          src={iconSrc}
          alt=""
          width={64}
          height={64}
          className="size-16 object-contain"
          unoptimized
          sizes="64px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[#121212]">
          <span className="text-base font-semibold leading-[22px]">{durationLabel}</span>
          <span className="text-sm font-medium leading-5">{planTitle}</span>
        </p>
        <p className="mt-2 text-xs font-normal leading-[18px] text-[#4b4b4b]">{description}</p>
      </div>
    </div>
  );
}

export type InsuranceCoverageBottomSheetProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Zero-dep / TP coverage explainer — Figma [2585:68086](https://www.figma.com/design/nW5SWmJdxxsCEDlqBN7C0L/Post-booking-experience?node-id=2585-68086).
 */
export function InsuranceCoverageBottomSheet({ open, onClose }: InsuranceCoverageBottomSheetProps) {
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

  const onBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!mounted) return null;

  return (
    <BottomSheetPortal>
      <div className="fixed inset-0 z-[100]">
        <button
          type="button"
          className={`absolute inset-0 bg-black/90 transition-opacity duration-[280ms] ease-out motion-reduce:opacity-100 motion-reduce:transition-none ${
            animateIn ? "opacity-100" : "opacity-0"
          }`}
          onClick={onBackdropClick}
          aria-label="Dismiss"
        />
        <div
          className={`absolute bottom-0 left-1/2 z-10 flex ${BOTTOM_SHEET_MAX_HEIGHT_CLASS} w-full max-w-[640px] -translate-x-1/2 flex-col overflow-hidden rounded-t-[24px] bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-transform duration-[280ms] ease-out motion-reduce:translate-y-0 motion-reduce:transition-none ${
            animateIn ? "translate-y-0" : "translate-y-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="insurance-coverage-sheet-title"
        >
          <div className="relative flex min-h-0 flex-1 flex-col">
            <header className="flex shrink-0 items-start justify-between gap-3 px-5 pt-6">
              <h2
                id="insurance-coverage-sheet-title"
                className="min-w-0 flex-1 text-left text-xl font-semibold leading-7 tracking-[-0.1px] text-[#121212]"
              >
                {INSURANCE_COVERAGE_SHEET_TITLE}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="cta-ghost -mr-1 -mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg text-[#121212] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/20 focus-visible:ring-offset-2"
                aria-label="Close"
              >
                <BottomSheetCloseIcon />
              </button>
            </header>

            <div
              className={`min-h-0 flex-1 overflow-y-auto px-5 pt-4 ${BOTTOM_SHEET_BODY_BEFORE_CTA_CLASS}`}
            >
              <div className="flex flex-col gap-5 rounded-xl bg-[#f5f5f5] p-5">
                {INSURANCE_COVERAGE_ITEMS.map((item) => (
                  <CoverageDetailRow key={item.planTitle} {...item} />
                ))}
              </div>
            </div>

            <div
              className={`shrink-0 bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] ${BOTTOM_SHEET_CTA_STRIP_TOP_CLASS}`}
            >
              <button type="button" onClick={onClose} className="primary-cta w-full">
                Okay
              </button>
            </div>
          </div>
        </div>
      </div>
    </BottomSheetPortal>
  );
}
