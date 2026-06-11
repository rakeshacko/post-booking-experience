"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { KYC_ASSETS } from "@/components/kyc/kyc-assets";
import {
  INSURANCE_COMPARE_BODY,
  INSURANCE_COMPARE_ROWS,
  INSURANCE_COMPARE_TITLE,
  INSURANCE_COVERAGE_ITEMS,
  INSURANCE_COVERAGE_SHEET_TITLE,
  INSURANCE_IDV_BODY,
  INSURANCE_IDV_TITLE,
  INSURANCE_INCLUDED_ADDONS,
  INSURANCE_PRICE_PROMISE,
  INSURANCE_SHEET_SHIVI_LINE,
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
              {/* Shivi framing — she sells the contract, not the card */}
              <div className="flex items-center gap-3">
                <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#f5f5f5]">
                  <Image
                    src={KYC_ASSETS.avatarSmall}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                    sizes="36px"
                  />
                </span>
                <p className="min-w-0 text-sm leading-5 text-[#121212]">
                  {INSURANCE_SHEET_SHIVI_LINE}
                </p>
              </div>

              {/* IDV — the headline justification */}
              <div className="mt-4 rounded-xl border border-[#e3d9fa] bg-[#f9f6ff] p-4">
                <p className="text-sm font-semibold leading-5 text-[#121212]">
                  {INSURANCE_IDV_TITLE}
                </p>
                <p className="mt-1.5 text-xs leading-[18px] text-[#4b4b4b]">{INSURANCE_IDV_BODY}</p>
              </div>

              {/* Base covers */}
              <div className="mt-4 flex flex-col gap-5 rounded-xl bg-[#f5f5f5] p-5">
                {INSURANCE_COVERAGE_ITEMS.map((item) => (
                  <CoverageDetailRow key={item.planTitle} {...item} />
                ))}
              </div>

              {/* Add-ons included at no extra charge */}
              <p className="mt-5 text-sm font-semibold leading-5 text-[#121212]">
                Included at no extra charge
              </p>
              <div className="mt-2 flex flex-col rounded-xl border border-[#e8e8e8] bg-white px-4 py-1">
                {INSURANCE_INCLUDED_ADDONS.map((addon, idx) => (
                  <div
                    key={addon.title}
                    className={`flex items-start gap-2.5 py-3 ${
                      idx > 0 ? "border-t border-dashed border-[#efefef]" : ""
                    }`}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                      className="mt-0.5 shrink-0"
                    >
                      <circle cx="12" cy="12" r="9" fill="#0fa457" />
                      <path
                        d="M8.4 12.2l2.4 2.4 4.8-5"
                        stroke="#ffffff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-5 text-[#121212]">{addon.title}</p>
                      <p className="text-xs leading-[18px] text-[#757575]">{addon.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* The acko.com comparison — preempt the other-tab check */}
              <p className="mt-5 text-sm font-semibold leading-5 text-[#121212]">
                {INSURANCE_COMPARE_TITLE}
              </p>
              <p className="mt-1.5 text-xs leading-[18px] text-[#4b4b4b]">{INSURANCE_COMPARE_BODY}</p>
              <div className="mt-3 overflow-hidden rounded-xl border border-[#e8e8e8]">
                {INSURANCE_COMPARE_ROWS.map((row, idx) => (
                  <div
                    key={row.label}
                    className={`flex items-center justify-between gap-3 px-4 py-3 ${
                      idx > 0 ? "border-t border-[#f0f0f0]" : ""
                    } ${row.highlight ? "bg-[#f9f6ff]" : "bg-white"}`}
                  >
                    <div className="min-w-0">
                      <p
                        className={`text-sm leading-5 ${
                          row.highlight
                            ? "font-semibold text-[#5920c5]"
                            : "font-medium text-[#121212]"
                        }`}
                      >
                        {row.label}
                      </p>
                      <p className="text-xs leading-[18px] text-[#757575]">
                        {row.idvLabel} · {row.addonsLabel}
                      </p>
                    </div>
                    <p
                      className={`shrink-0 text-sm font-semibold leading-5 tabular-nums ${
                        row.highlight ? "text-[#5920c5]" : "text-[#121212]"
                      }`}
                    >
                      {row.priceLabel}
                    </p>
                  </div>
                ))}
              </div>

              {/* Her price promise */}
              <div className="mt-3 rounded-xl bg-[#e7f6ee] px-4 py-3">
                <p className="text-xs font-medium leading-[18px] text-[#0c7a42]">
                  {INSURANCE_PRICE_PROMISE}
                </p>
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
