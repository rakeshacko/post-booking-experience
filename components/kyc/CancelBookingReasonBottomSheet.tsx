"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import checkboxSelected from "@/assets/Checkbox selected.svg";
import checkboxUnselected from "@/assets/Checkbox unselected.svg";
import { BottomSheetCloseIcon } from "@/components/ui/BottomSheetCloseIcon";
import { BottomSheetPortal } from "@/components/ui/BottomSheetPortal";
import {
  CANCEL_BOOKING_REASON_OPTIONS,
  CANCEL_BOOKING_REASON_SHEET_CTA,
  CANCEL_BOOKING_REASON_SHEET_TITLE,
  type CancelBookingReasonId,
} from "@/lib/cancel-booking-content";
import { cn } from "@/lib/utils";

const SHEET_TRANSITION_MS = 280;

type CancelBookingReasonOptionRowProps = {
  label: string;
  selected: boolean;
  onSelect: () => void;
};

function CancelBookingReasonOptionRow({
  label,
  selected,
  onSelect,
}: CancelBookingReasonOptionRowProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg border p-3 text-left transition-colors",
        selected
          ? "border-[#121212] bg-[#f5f5f5]"
          : "border-[#e8e8e8] bg-white hover:bg-[#fafafa]",
      )}
    >
      <span className="relative h-4 w-4 shrink-0" aria-hidden>
        <Image
          src={selected ? checkboxSelected : checkboxUnselected}
          alt=""
          fill
          className="object-contain"
          unoptimized
          sizes="16px"
        />
      </span>
      <span className="min-w-0 flex-1 text-sm leading-5 text-[#121212]">{label}</span>
    </button>
  );
}

export type CancelBookingReasonBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (reasonId: CancelBookingReasonId) => void;
};

/**
 * Cancel reason picker — Figma Post-booking-experience / node 2711:21013.
 */
export function CancelBookingReasonBottomSheet({
  open,
  onClose,
  onConfirm,
}: CancelBookingReasonBottomSheetProps) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [selectedReason, setSelectedReason] = useState<CancelBookingReasonId | null>(null);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    setSelectedReason(null);
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
    if (selectedReason == null) return;
    onConfirm(selectedReason);
  }, [onConfirm, selectedReason]);

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
          className={`absolute bottom-0 left-1/2 z-10 flex w-full max-w-[640px] -translate-x-1/2 flex-col overflow-hidden rounded-t-[24px] bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-transform duration-[280ms] ease-out motion-reduce:translate-y-0 motion-reduce:transition-none ${
            animateIn ? "translate-y-0" : "translate-y-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
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

            <div className="px-5 pb-5 pt-6">
              <h2
                id={titleId}
                className="pr-10 text-left text-xl font-semibold leading-7 tracking-[-0.1px] text-[#121212]"
              >
                {CANCEL_BOOKING_REASON_SHEET_TITLE}
              </h2>

              <div
                className="mt-4 flex flex-col gap-3"
                role="group"
                aria-label="Cancellation reason"
              >
                {CANCEL_BOOKING_REASON_OPTIONS.map((option) => (
                  <CancelBookingReasonOptionRow
                    key={option.id}
                    label={option.label}
                    selected={selectedReason === option.id}
                    onSelect={() =>
                      setSelectedReason((current) =>
                        current === option.id ? null : option.id,
                      )
                    }
                  />
                ))}
              </div>
            </div>

            <div className="shrink-0 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={selectedReason == null}
                className="primary-cta w-full disabled:cursor-not-allowed disabled:bg-[#a0a0a0] disabled:opacity-100"
              >
                {CANCEL_BOOKING_REASON_SHEET_CTA}
              </button>
            </div>
          </div>
        </div>
      </div>
    </BottomSheetPortal>
  );
}
