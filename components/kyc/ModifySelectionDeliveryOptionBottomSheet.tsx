"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import { ModifySelectionDeliveryOptionCard } from "@/components/kyc/ModifySelectionDeliveryOptionCard";
import { BOOKING_CONFIRMED_ASSETS } from "@/components/kyc/kyc-booking-confirmed-assets";
import { BottomSheetCloseIcon } from "@/components/ui/BottomSheetCloseIcon";
import { BottomSheetPortal } from "@/components/ui/BottomSheetPortal";
import {
  BOTTOM_SHEET_BODY_BEFORE_CTA_CLASS,
  BOTTOM_SHEET_CTA_STRIP_TOP_CLASS,
  BOTTOM_SHEET_MAX_HEIGHT_CLASS,
} from "@/components/ui/bottom-sheet-layout";
import {
  BOOKING_EXPRESS_DELIVERY_TEXT_CLASS,
  BOOKING_STANDARD_DELIVERY_TEXT_CLASS,
  getBookingDeliveryIconSrc,
} from "@/lib/experience-flow-content";
import {
  MODIFY_SELECTION_DELIVERY_SHEET_TITLE,
  MODIFY_SELECTION_SHEET_STANDARD_DELIVERY_LINE,
  modifySelectionStandardDeliveryPriceInr,
  type ModifySelectionDeliveryChoice,
} from "@/lib/modify-selection-colours-content";
import { cn } from "@/lib/utils";

const SHEET_TRANSITION_MS = 280;

export type ModifySelectionDeliveryOptionBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (choice: ModifySelectionDeliveryChoice) => void;
  /** Express delivery price — same as shown on the colour card. */
  expressDeliveryPriceInr: number;
  expressDeliveryLine: string;
  initialDeliveryChoice?: ModifySelectionDeliveryChoice;
};

/**
 * Colour change — pick express vs standard delivery (Figma 2674:8617).
 */
export function ModifySelectionDeliveryOptionBottomSheet({
  open,
  onClose,
  onConfirm,
  expressDeliveryPriceInr,
  expressDeliveryLine,
  initialDeliveryChoice = "express",
}: ModifySelectionDeliveryOptionBottomSheetProps) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [deliveryChoice, setDeliveryChoice] = useState<ModifySelectionDeliveryChoice>("express");
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    setDeliveryChoice(initialDeliveryChoice);
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
  }, [open, initialDeliveryChoice]);

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
    onConfirm(deliveryChoice);
  }, [deliveryChoice, onConfirm]);

  if (!mounted) return null;

  const standardDeliveryPriceInr =
    modifySelectionStandardDeliveryPriceInr(expressDeliveryPriceInr);

  return (
    <BottomSheetPortal>
      <div className="fixed inset-0 z-[100]">
        <button
          type="button"
          className={cn(
            "absolute inset-0 bg-black/90 transition-opacity duration-[280ms] ease-out motion-reduce:opacity-100 motion-reduce:transition-none",
            animateIn ? "opacity-100" : "opacity-0",
          )}
          onClick={onClose}
          aria-label="Dismiss"
        />
        <div
          className={cn(
            `absolute bottom-0 left-1/2 z-10 flex ${BOTTOM_SHEET_MAX_HEIGHT_CLASS} w-full max-w-[640px] -translate-x-1/2 flex-col overflow-hidden rounded-t-[24px] bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-transform duration-[280ms] ease-out motion-reduce:translate-y-0 motion-reduce:transition-none`,
            animateIn ? "translate-y-0" : "translate-y-full",
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <div className="relative flex min-h-0 flex-1 flex-col">
            <header className="flex shrink-0 items-start justify-between gap-3 px-5 pt-6">
              <h2
                id={titleId}
                className="min-w-0 flex-1 pr-2 text-left text-xl font-semibold leading-7 tracking-[-0.1px] text-[#121212]"
              >
                {MODIFY_SELECTION_DELIVERY_SHEET_TITLE}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="cta-ghost -mr-1 flex size-10 shrink-0 items-center justify-center rounded-lg text-[#121212] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/20 focus-visible:ring-offset-2"
                aria-label="Close"
              >
                <BottomSheetCloseIcon />
              </button>
            </header>

            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto px-5 pt-3",
                BOTTOM_SHEET_BODY_BEFORE_CTA_CLASS,
              )}
            >
              <div className="flex flex-col gap-4" role="group" aria-label={MODIFY_SELECTION_DELIVERY_SHEET_TITLE}>
                <ModifySelectionDeliveryOptionCard
                  selected={deliveryChoice === "express"}
                  onSelect={() => setDeliveryChoice("express")}
                  deliveryLine={expressDeliveryLine}
                  deliveryLineClass={BOOKING_EXPRESS_DELIVERY_TEXT_CLASS}
                  iconSrc={BOOKING_CONFIRMED_ASSETS.expressDelivery}
                  priceInr={expressDeliveryPriceInr}
                />
                <ModifySelectionDeliveryOptionCard
                  selected={deliveryChoice === "standard"}
                  onSelect={() => setDeliveryChoice("standard")}
                  deliveryLine={MODIFY_SELECTION_SHEET_STANDARD_DELIVERY_LINE}
                  deliveryLineClass={BOOKING_STANDARD_DELIVERY_TEXT_CLASS}
                  iconSrc={getBookingDeliveryIconSrc("standard")}
                  priceInr={standardDeliveryPriceInr}
                />
              </div>
            </div>

            <div
              className={cn(
                "shrink-0 bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]",
                BOTTOM_SHEET_CTA_STRIP_TOP_CLASS,
              )}
            >
              <button type="button" onClick={handleConfirm} className="primary-cta w-full">
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </BottomSheetPortal>
  );
}
