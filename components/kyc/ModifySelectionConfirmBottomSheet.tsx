"use client";

import Image, { type StaticImageData } from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import {
  BOTTOM_SHEET_BODY_BEFORE_CTA_CLASS,
  BOTTOM_SHEET_CTA_STRIP_TOP_CLASS,
  BOTTOM_SHEET_MAX_HEIGHT_CLASS,
} from "@/components/ui/bottom-sheet-layout";
import { BottomSheetConfirmBulletList } from "@/components/ui/BottomSheetConfirmBulletList";
import { bottomSheetTitleWidthWithIllustration } from "@/components/ui/bottom-sheet-title-layout";
import { BottomSheetCloseIcon } from "@/components/ui/BottomSheetCloseIcon";
import { BottomSheetPortal } from "@/components/ui/BottomSheetPortal";

/** Enter/exit slide duration — keep in sync with `FullPaymentConfirmBottomSheet` */
const SHEET_TRANSITION_MS = 280;

type ModifySelectionConfirmBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  header: string;
  points: readonly string[];
  iconSrc: StaticImageData | string;
  confirmCtaLabel: string;
};

/**
 * Modify booking — confirm before continuing to colour / variant / car flow.
 * Content-hug height + bullet list — aligned with {@link FullPaymentConfirmBottomSheet}.
 */
export function ModifySelectionConfirmBottomSheet({
  open,
  onClose,
  onConfirm,
  header,
  points,
  iconSrc,
  confirmCtaLabel,
}: ModifySelectionConfirmBottomSheetProps) {
  const titleId = useId();
  const listId = useId();
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
    <BottomSheetPortal>
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
          className={`absolute bottom-0 left-1/2 z-10 flex w-full max-w-[640px] -translate-x-1/2 flex-col overflow-hidden rounded-t-[24px] bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-transform duration-[280ms] ease-out motion-reduce:translate-y-0 motion-reduce:transition-none ${BOTTOM_SHEET_MAX_HEIGHT_CLASS} ${
            animateIn ? "translate-y-0" : "translate-y-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={listId}
        >
          <div className="relative flex flex-col">
            <button
              type="button"
              onClick={onClose}
              className="cta-ghost absolute right-5 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-lg text-[#121212] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/20 focus-visible:ring-offset-2"
              aria-label="Close"
            >
              <BottomSheetCloseIcon />
            </button>

            <div
              className={`overflow-y-auto overscroll-contain px-5 pt-6 ${BOTTOM_SHEET_BODY_BEFORE_CTA_CLASS}`}
            >
              <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden bg-white" aria-hidden>
                <Image
                  src={iconSrc}
                  alt=""
                  width={72}
                  height={72}
                  className="h-[72px] w-[72px] object-contain"
                  unoptimized
                  sizes="72px"
                />
              </div>

              <h2
                id={titleId}
                className={`mt-[24px] ${bottomSheetTitleWidthWithIllustration} text-left text-[20px] font-semibold leading-[1.35] tracking-[-0.1px] text-[#121212]`}
              >
                {header}
              </h2>

              <BottomSheetConfirmBulletList id={listId} points={points} />
            </div>

            <div
              className={`shrink-0 bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] ${BOTTOM_SHEET_CTA_STRIP_TOP_CLASS}`}
            >
              <button type="button" onClick={handleConfirm} className="primary-cta w-full">
                {confirmCtaLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </BottomSheetPortal>
  );
}
