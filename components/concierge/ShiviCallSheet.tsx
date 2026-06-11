"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { KYC_ASSETS } from "@/components/kyc/kyc-assets";
import { BottomSheetPortal } from "@/components/ui/BottomSheetPortal";

/** Parity with the other bottom sheets. */
const SHEET_TRANSITION_MS = 280;

export type ShiviCallSheetProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * “Call me” confirmation — tapping a call affordance gets an immediate,
 * personal commitment from Shivi instead of a ticket number.
 */
export function ShiviCallSheet({ open, onClose }: ShiviCallSheetProps) {
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

  if (!mounted) return null;

  return (
    <BottomSheetPortal>
      <div className="fixed inset-0 z-[100] flex flex-col">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className={`absolute inset-0 bg-black/90 transition-opacity duration-[280ms] ease-out motion-reduce:transition-none ${
            animateIn ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`relative z-10 mx-auto mt-auto flex w-full max-w-[640px] shrink-0 flex-col overflow-hidden rounded-t-[24px] bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-transform duration-[280ms] ease-out motion-reduce:translate-y-0 motion-reduce:transition-none ${
            animateIn ? "translate-y-0" : "translate-y-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="shivi-call-sheet-title"
        >
          <div className="flex flex-col items-center px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6 text-center">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-[#f5f5f5]">
              <Image
                src={KYC_ASSETS.avatarSmall}
                alt=""
                fill
                className="object-cover"
                unoptimized
                sizes="64px"
                priority
              />
            </div>

            <h2
              id="shivi-call-sheet-title"
              className="mt-5 text-xl font-medium leading-7 text-[#121212]"
            >
              On it — I&apos;ll call you within 10 minutes.
            </h2>
            <p className="mt-2 text-sm leading-5 text-[#4b4b4b]">
              The call comes from ACKO Drive on your number ending in 21. Keep your phone handy.
            </p>

            <button
              type="button"
              className="primary-cta mt-7 w-full focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/30 focus-visible:ring-offset-2"
              onClick={onClose}
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </BottomSheetPortal>
  );
}
