"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import shiviAvatar from "@/assets/Shivi small.png";
import { ShiviIntroCoachmark } from "@/components/kyc/ShiviIntroCoachmark";

/** Parity with `ManageBookingBottomSheet` / `WhatsNextTimelineBottomSheet`. */
const SHEET_TRANSITION_MS = 280;

const USER_NAME = "Sharath";

export type ShiviIntroBottomSheetProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Shivi RM intro — [Figma 2479:7600](https://www.figma.com/design/nW5SWmJdxxsCEDlqBN7C0L/Post-booking-experience?node-id=2479-7600).
 */
export function ShiviIntroBottomSheet({ open, onClose }: ShiviIntroBottomSheetProps) {
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

  const onGotIt = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col">
      <div
        className={`absolute inset-0 bg-black/90 transition-opacity duration-[280ms] ease-out motion-reduce:opacity-100 motion-reduce:transition-none ${
          animateIn ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden
      />
      {animateIn ? <ShiviIntroCoachmark /> : null}
      <div
        className={`relative z-10 mx-auto mt-auto flex w-full max-w-[640px] shrink-0 flex-col overflow-hidden rounded-t-[24px] bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-transform duration-[280ms] ease-out motion-reduce:translate-y-0 motion-reduce:transition-none ${
          animateIn ? "translate-y-0" : "translate-y-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shivi-intro-sheet-title"
      >
        <div className="flex flex-col items-center px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f5f5f5]">
            <Image
              src={shiviAvatar}
              alt=""
              fill
              className="object-cover"
              unoptimized
              sizes="64px"
              priority
            />
          </div>

          <h2
            id="shivi-intro-sheet-title"
            className="mt-6 w-full text-center text-base font-medium leading-6 text-[#121212]"
          >
            Hi {USER_NAME},
          </h2>
          <p className="mt-2 w-full text-center text-base font-normal leading-6 text-[#121212]">
            Meet Shivi, your relationship manager. She will guide you through every step and is
            always available if you need help.
          </p>

          <button
            type="button"
            className="primary-cta mt-8 w-full focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/30 focus-visible:ring-offset-2"
            onClick={onGotIt}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
