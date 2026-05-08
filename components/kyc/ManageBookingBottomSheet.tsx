"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import closeIcon from "@/assets/Close.svg";

import { KYC_ASSETS } from "@/components/kyc/kyc-assets";

/** Keeps parity with other bottom sheets in the app */
const SHEET_TRANSITION_MS = 280;

type SheetOptionRowProps = {
  iconSrc: string;
  label: string;
  onClick?: () => void;
};

/**
 * Row matching Figma 2192:7653 — 40×40 rounded icon tile on light grey, 12px gaps, 20px chevron.
 */
function SheetOptionRow({ iconSrc, label, onClick }: SheetOptionRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-mx-2 flex w-[calc(100%+16px)] cursor-pointer items-center gap-3 rounded-xl px-2 py-0 text-left transition-colors hover:bg-[#f5f5f5] active:bg-[#ebebeb]"
    >
      <span className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f5f5f5]">
          <span className="relative h-6 w-6 shrink-0">
            <Image src={iconSrc} alt="" fill className="object-contain" unoptimized sizes="24px" />
          </span>
        </span>
        <span className="min-w-0 flex-1 text-sm font-medium leading-5 text-[#121212]">{label}</span>
      </span>
      <span className="relative h-5 w-5 shrink-0">
        <Image
          src={KYC_ASSETS.chevronRight}
          alt=""
          fill
          className="object-contain"
          unoptimized
          sizes="20px"
        />
      </span>
    </button>
  );
}

export type ManageBookingBottomSheetProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * “Manage your booking” — bottom sheet from Figma [2192:7653](https://www.figma.com/design/nW5SWmJdxxsCEDlqBN7C0L/Post-booking-experience?node-id=2192-7653).
 */
export function ManageBookingBottomSheet({ open, onClose }: ManageBookingBottomSheetProps) {
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
        className={`absolute bottom-0 left-1/2 z-10 flex max-h-[90dvh] w-full max-w-[360px] -translate-x-1/2 flex-col overflow-y-auto rounded-t-[24px] bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-transform duration-[280ms] ease-out motion-reduce:translate-y-0 motion-reduce:transition-none ${
          animateIn ? "translate-y-0" : "translate-y-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="manage-booking-sheet-title"
      >
        <header className="flex shrink-0 items-center gap-3 px-5 pt-6">
          <h2
            id="manage-booking-sheet-title"
            className="min-w-0 flex-1 text-left text-xl font-semibold leading-7 tracking-[-0.1px] text-[#121212]"
          >
            Manage your booking
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="cta-ghost shrink-0 flex size-10 items-center justify-end rounded-lg text-[#121212] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/20 focus-visible:ring-offset-2"
            aria-label="Close"
          >
            <Image
              src={closeIcon}
              alt=""
              width={24}
              height={24}
              className="block shrink-0"
              unoptimized
              aria-hidden
            />
          </button>
        </header>

        <div className="mt-6 flex flex-col gap-[18px] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <SheetOptionRow iconSrc={KYC_ASSETS.iconBooking} label="Your booking details" />
          <hr className="border-0 border-t border-dashed border-[#e8e8e8]" />
          <SheetOptionRow iconSrc={KYC_ASSETS.iconPayment} label="Payment summary" />
          <hr className="border-0 border-t border-dashed border-[#e8e8e8]" />
          <SheetOptionRow iconSrc={KYC_ASSETS.iconModify} label="Modify booking" />
        </div>
      </div>
    </div>
  );
}
