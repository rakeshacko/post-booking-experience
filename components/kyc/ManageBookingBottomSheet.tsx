"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronUp } from "lucide-react";

import arrowRightIcon from "@/assets/Arrow_right.svg";
import changeSelectionIcon from "@/assets/change selection.svg";
import cancelBookingIcon from "@/assets/cancel booking.svg";
import { BOOKING_CONFIRMED_ASSETS } from "@/components/kyc/kyc-booking-confirmed-assets";
import { BottomSheetCloseIcon } from "@/components/ui/BottomSheetCloseIcon";
import {
  BOTTOM_SHEET_MAX_HEIGHT_CLASS,
  BOTTOM_SHEET_SCROLL_BODY_CLASS,
  BOTTOM_SHEET_SCROLL_PANEL_CLASS,
} from "@/components/ui/bottom-sheet-layout";

/** Keeps parity with other bottom sheets in the app */
const SHEET_TRANSITION_MS = 280;

const CAR_TITLE = "Hyundai Creta";
const CAR_VARIANT = "1.5 X-Line AT Diesel";
const CAR_COLOR = "Starry Night";
const DELIVERY_LINE = "Express delivery by 10 Jun '25";

/** Demo payment figures — Figma 2486:11207 */
const PAYMENT_SUMMARY = {
  ackoDrivePrice: "₹13,73,780",
  onRoadPrice: "₹14,33,481",
  ackoDriveDiscount: "-₹69,701",
  bookingAmountPaid: "₹10,000",
  amountToPay: "₹13,63,780",
} as const;

function ManageBookingCarCard() {
  return (
    <div className="relative h-[228px] w-full shrink-0 overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white">
      <div aria-hidden className="absolute inset-0">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={BOOKING_CONFIRMED_ASSETS.cardBackdrop}
            alt=""
            fill
            className="object-cover"
            style={{ objectPosition: "center 28%" }}
            sizes="(max-width: 640px) 100vw, 320px"
            unoptimized
          />
        </div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(255,255,255,0) 68%, rgba(255,255,255,0.7) 100%), linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 25%)",
          }}
        />
      </div>

      <div className="absolute left-1/2 top-[30px] h-[85px] w-[150px] -translate-x-1/2 overflow-hidden">
        <div className="relative mx-auto h-full w-full max-w-[150px]">
          <Image
            src={BOOKING_CONFIRMED_ASSETS.carCutout}
            alt=""
            fill
            className="object-contain object-bottom"
            sizes="150px"
            unoptimized
          />
        </div>
      </div>

      <div className="absolute inset-x-2 bottom-2 overflow-hidden rounded-xl border border-white/60 bg-white/90 p-3 shadow-sm backdrop-blur-[12px]">
        <p className="text-base font-medium leading-6 text-[#121212]">{CAR_TITLE}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs leading-[18px] text-[#121212]">
          <span className="shrink-0">{CAR_VARIANT}</span>
          <span
            className="inline-flex h-[18px] w-4 shrink-0 items-center justify-center"
            aria-hidden
          >
            <Image
              src={BOOKING_CONFIRMED_ASSETS.dotSeparator}
              alt=""
              width={16}
              height={16}
              className="block size-4 object-contain"
              unoptimized
              sizes="16px"
            />
          </span>
          <span className="shrink-0">{CAR_COLOR}</span>
        </div>
        <div className="mt-2 flex items-center gap-1">
          <p className="text-xs font-normal leading-[18px] text-[#5920c5]">{DELIVERY_LINE}</p>
          <span className="relative h-4 w-4 shrink-0" aria-hidden>
            <Image
              src={BOOKING_CONFIRMED_ASSETS.expressDelivery}
              alt=""
              width={16}
              height={16}
              className="h-4 w-4 object-contain"
              unoptimized
              sizes="16px"
            />
          </span>
        </div>
      </div>
    </div>
  );
}

function PaymentSummaryCard() {
  const [priceBreakdownOpen, setPriceBreakdownOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e8e8e8]">
      <div className="bg-white px-4 pb-4 pt-4">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 text-left"
          onClick={() => setPriceBreakdownOpen((open) => !open)}
          aria-expanded={priceBreakdownOpen}
        >
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="text-sm leading-5 text-[#121212]">ACKO Drive price</span>
            <ChevronUp
              className={`size-4 shrink-0 text-[#121212] transition-transform ${
                priceBreakdownOpen ? "" : "rotate-180"
              }`}
              aria-hidden
              strokeWidth={2}
            />
          </span>
          <span className="shrink-0 text-sm font-medium leading-5 text-[#121212]">
            {PAYMENT_SUMMARY.ackoDrivePrice}
          </span>
        </button>

        {priceBreakdownOpen ? (
          <div className="mt-3 rounded-lg bg-[#f5f5f5] px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs leading-[18px] text-[#4b4b4b]">On-road price</span>
              <span className="text-xs font-medium leading-[18px] text-[#121212]">
                {PAYMENT_SUMMARY.onRoadPrice}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-xs leading-[18px] text-[#4b4b4b]">ACKO Drive discount</span>
              <span className="text-xs font-medium leading-[18px] text-[#0fa457]">
                {PAYMENT_SUMMARY.ackoDriveDiscount}
              </span>
            </div>
          </div>
        ) : null}

        <hr className="my-4 border-0 border-t border-dashed border-[#e8e8e8]" />

        <div className="flex items-center justify-between gap-2">
          <span className="text-sm leading-5 text-[#121212]">Booking amount paid</span>
          <span className="text-sm font-medium leading-5 text-[#121212]">
            {PAYMENT_SUMMARY.bookingAmountPaid}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 bg-[#f5f5f5] px-4 py-4">
        <span className="text-sm font-semibold leading-5 text-[#121212]">Amount to pay</span>
        <span className="text-base font-medium leading-6 text-[#121212]">
          {PAYMENT_SUMMARY.amountToPay}
        </span>
      </div>
    </div>
  );
}

type ModifyBookingActionRowProps = {
  iconSrc: string;
  title: string;
  description: string;
  onClick?: () => void;
};

function ModifyBookingActionRow({ iconSrc, title, description, onClick }: ModifyBookingActionRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-4 px-[15px] py-[15px] text-left transition-colors hover:bg-[#fafafa] active:bg-[#f5f5f5]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f5f5f5]">
        <span className="relative h-6 w-6 shrink-0">
          <Image src={iconSrc} alt="" fill className="object-contain" unoptimized sizes="24px" />
        </span>
      </span>
      <span className="min-w-0 flex-1 pt-0.5">
        <span className="block text-sm font-medium leading-5 text-[#121212]">{title}</span>
        <span className="mt-1 block text-xs leading-[18px] text-[#4b4b4b]">{description}</span>
      </span>
      <span className="relative mt-0.5 h-5 w-5 shrink-0">
        <Image
          src={arrowRightIcon}
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
 * “Your booking” manage sheet — Figma [2486:11166](https://www.figma.com/design/nW5SWmJdxxsCEDlqBN7C0L/Post-booking-experience?node-id=2486-11166).
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
        className={`absolute bottom-0 left-1/2 z-10 flex ${BOTTOM_SHEET_MAX_HEIGHT_CLASS} w-full max-w-[640px] -translate-x-1/2 flex-col ${BOTTOM_SHEET_SCROLL_PANEL_CLASS} rounded-t-[24px] bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-transform duration-[280ms] ease-out motion-reduce:translate-y-0 motion-reduce:transition-none ${
          animateIn ? "translate-y-0" : "translate-y-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="manage-booking-sheet-title"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 bg-white px-5 pt-6">
          <h2
            id="manage-booking-sheet-title"
            className="min-w-0 flex-1 text-left text-[20px] font-semibold leading-7 tracking-[-0.1px] text-[#121212]"
          >
            Your booking
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
          className={`${BOTTOM_SHEET_SCROLL_BODY_CLASS} px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4`}
        >
          <div className="flex flex-col gap-8">
          <ManageBookingCarCard />

          <section aria-labelledby="manage-booking-payment-heading">
            <h3
              id="manage-booking-payment-heading"
              className="mb-4 text-base font-medium leading-6 text-[#121212]"
            >
              Payment summary
            </h3>
            <PaymentSummaryCard />
          </section>

          <section aria-labelledby="manage-booking-modify-heading">
            <h3
              id="manage-booking-modify-heading"
              className="mb-4 text-base font-medium leading-6 text-[#121212]"
            >
              Modify booking
            </h3>
            <div className="overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white">
              <ModifyBookingActionRow
                iconSrc={changeSelectionIcon}
                title="Change selection"
                description="You can update your selection only once before your car is allocated."
              />
              <hr className="border-0 border-t border-dashed border-[#e8e8e8]" />
              <ModifyBookingActionRow
                iconSrc={cancelBookingIcon}
                title="Cancel booking"
                description="Cancel before car allocation for a full refund. A 50% cancellation fee applies after allocation."
              />
            </div>
          </section>
          </div>
        </div>
      </div>
    </div>
  );
}
