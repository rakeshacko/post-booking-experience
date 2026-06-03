"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { BottomSheetCloseIcon } from "@/components/ui/BottomSheetCloseIcon";
import { BottomSheetPortal } from "@/components/ui/BottomSheetPortal";
import {
  BOTTOM_SHEET_MAX_HEIGHT_CLASS,
  BOTTOM_SHEET_SCROLL_BODY_CLASS,
  BOTTOM_SHEET_SCROLL_PANEL_CLASS,
} from "@/components/ui/bottom-sheet-layout";

/** Parity with `ManageBookingBottomSheet` motion. */
const SHEET_TRANSITION_MS = 280;

export type WhatsNextTimelineBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

/**
 * Bottom sheet presenting the “What’s next” timeline or a custom substitute (e.g. `LoanProcessingWhatsNext`).
 * Unmounts when closed so timeline layout/connector logic runs fresh on each open.
 */
export function WhatsNextTimelineBottomSheet({
  open,
  onClose,
  children,
}: WhatsNextTimelineBottomSheetProps) {
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
        className={`absolute bottom-0 left-1/2 z-10 flex ${BOTTOM_SHEET_MAX_HEIGHT_CLASS} w-full max-w-[640px] -translate-x-1/2 flex-col ${BOTTOM_SHEET_SCROLL_PANEL_CLASS} rounded-t-[24px] bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-transform duration-[280ms] ease-out motion-reduce:translate-y-0 motion-reduce:transition-none ${
          animateIn ? "translate-y-0" : "translate-y-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="whats-next-sheet-title"
      >
        <header className="flex shrink-0 items-center gap-3 bg-white px-5 pt-6">
          <h2
            id="whats-next-sheet-title"
            className="min-w-0 flex-1 text-left text-xl font-semibold leading-7 tracking-[-0.1px] text-[#121212]"
          >
            What&apos;s next?
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="cta-ghost shrink-0 flex size-10 items-center justify-end rounded-lg text-[#121212] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/20 focus-visible:ring-offset-2"
            aria-label="Close"
          >
            <BottomSheetCloseIcon />
          </button>
        </header>

        <div className={`${BOTTOM_SHEET_SCROLL_BODY_CLASS} px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6`}>
          {children}
        </div>
      </div>
    </div>
    </BottomSheetPortal>
  );
}
