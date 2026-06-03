"use client";

import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";

import arrowRightIcon from "@/assets/Arrow_right.svg";
import changeSelectionIcon from "@/assets/change selection.svg";
import cancelBookingIcon from "@/assets/cancel booking.svg";
import {
  DEMO_VEHICLE_CHASSIS_NO,
  DEMO_VEHICLE_ENGINE_NO,
} from "@/components/kyc/demo-vehicle-identification";
import { BookingCarCardDetails } from "@/components/kyc/BookingCarCardDetails";
import { DEMO_BOOKING_ID } from "@/components/kyc/booking-car-card-content";
import { BOOKING_CONFIRMED_ASSETS } from "@/components/kyc/kyc-booking-confirmed-assets";
import { BottomSheetCloseIcon } from "@/components/ui/BottomSheetCloseIcon";
import { BottomSheetPortal } from "@/components/ui/BottomSheetPortal";
import {
  BOTTOM_SHEET_MAX_HEIGHT_CLASS,
  BOTTOM_SHEET_SCROLL_BODY_CLASS,
  BOTTOM_SHEET_SCROLL_PANEL_CLASS,
} from "@/components/ui/bottom-sheet-layout";
import { ChooseLoanPaymentSummaryCard } from "@/components/payment/ChooseLoanPaymentSummaryCard";
import { ON_ROAD_PRICE_INR } from "@/components/payment/loan-amount-demo-constants";
import { PaymentSummaryCard } from "@/components/payment/PaymentSummaryCard";
import {
  modifyBookingCancelDescription,
  modifyBookingChangeDescription,
  resolveModifyBookingFeeTier,
} from "@/lib/manage-booking-modify";
import { FULL_PAYMENT_BANK_ID, INSURANCE_PAYMENT_KIND } from "@/lib/paymentUrls";

/** Keeps parity with other bottom sheets in the app */
const SHEET_TRANSITION_MS = 280;

function ManageBookingCarCardVisualStage({ emphasizeBottomMerge = false }: { emphasizeBottomMerge?: boolean }) {
  return (
    <>
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
            backgroundImage: emphasizeBottomMerge
              ? "linear-gradient(180deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.75) 62%, #ffffff 88%), linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 25%)"
              : "linear-gradient(180deg, rgba(255,255,255,0) 68%, rgba(255,255,255,0.7) 100%), linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 25%)",
          }}
        />
        {emphasizeBottomMerge ? (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[152px]"
            style={{
              background:
                "linear-gradient(to top, #ffffff 0%, #ffffff 42%, rgba(255,255,255,0.92) 58%, rgba(255,255,255,0) 100%)",
            }}
            aria-hidden
          />
        ) : null}
      </div>

      <div className="absolute left-1/2 top-[30px] z-[2] h-[85px] w-[150px] -translate-x-1/2 overflow-hidden">
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
    </>
  );
}

function ManageBookingCarCardDetails({ showVehicleIdentification }: { showVehicleIdentification: boolean }) {
  return (
    <BookingCarCardDetails
      engineNo={showVehicleIdentification ? DEMO_VEHICLE_ENGINE_NO : undefined}
      chassisNo={showVehicleIdentification ? DEMO_VEHICLE_CHASSIS_NO : undefined}
      showCopyButtons={showVehicleIdentification}
    />
  );
}

function ManageBookingCarCard({ showVehicleIdentification = false }: { showVehicleIdentification?: boolean }) {
  const panelClassName =
    "overflow-hidden rounded-xl border border-white/60 bg-white/90 p-3 shadow-sm backdrop-blur-[12px]";

  if (showVehicleIdentification) {
    return (
      <div className="relative w-full shrink-0 overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white">
        <div className="relative h-[228px] w-full bg-white">
          <ManageBookingCarCardVisualStage emphasizeBottomMerge />
        </div>
        <div className={`relative z-10 mx-2 -mt-24 mb-2 ${panelClassName}`}>
          <ManageBookingCarCardDetails showVehicleIdentification />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[228px] w-full shrink-0 overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white">
      <ManageBookingCarCardVisualStage emphasizeBottomMerge={false} />
      <div className={`absolute inset-x-2 bottom-2 ${panelClassName}`}>
        <ManageBookingCarCardDetails showVehicleIdentification={false} />
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
  /**
   * Post–car-allocation journey (e.g. `/payment/default`) — engine/chassis rows + copy icons;
   * card grows below a fixed 228px visual stage.
   */
  showVehicleIdentification?: boolean;
};

/**
 * “Your booking” manage sheet — Figma [2486:11166](https://www.figma.com/design/nW5SWmJdxxsCEDlqBN7C0L/Post-booking-experience?node-id=2486-11166).
 */
function parseConfirmedLoanPlan(searchParams: URLSearchParams) {
  const loan = Number(searchParams.get("loan_amount"));
  if (!Number.isFinite(loan) || loan <= 0) {
    return null;
  }

  const loanAmountInr = Math.round(loan);
  const totalDownPaymentInr = Math.max(0, Math.round(ON_ROAD_PRICE_INR - loanAmountInr));
  const isInsuranceCheckout = searchParams.get("payment_kind") === INSURANCE_PAYMENT_KIND;

  const downPaymentRaw = searchParams.get("down_payment");
  const downPayment =
    downPaymentRaw != null && downPaymentRaw !== "" ? Number(downPaymentRaw) : NaN;
  const originalDownPayment = Number(searchParams.get("original_down_payment"));
  const hasOriginal =
    Number.isFinite(originalDownPayment) && originalDownPayment > 0;

  if (isInsuranceCheckout && totalDownPaymentInr > 0) {
    return {
      loanAmountInr,
      downPaymentAmountInr: 0,
      downPaymentPaidInr: totalDownPaymentInr,
      downPaymentFullyPaid: true,
    };
  }

  if (
    hasOriginal &&
    (downPaymentRaw === "0" || !Number.isFinite(downPayment) || downPayment <= 0)
  ) {
    return {
      loanAmountInr,
      downPaymentAmountInr: 0,
      downPaymentPaidInr: Math.round(originalDownPayment),
      downPaymentFullyPaid: true,
    };
  }

  if (downPaymentRaw == null || downPaymentRaw === "") {
    if (totalDownPaymentInr > 0) {
      return {
        loanAmountInr,
        downPaymentAmountInr: 0,
        downPaymentPaidInr: totalDownPaymentInr,
        downPaymentFullyPaid: true,
      };
    }
    return null;
  }

  if (!Number.isFinite(downPayment) || downPayment <= 0) {
    return null;
  }

  const downPaymentAmountInr = Math.round(downPayment);
  const hasPartialDownPayment =
    hasOriginal && originalDownPayment > downPaymentAmountInr;

  return {
    loanAmountInr,
    downPaymentAmountInr,
    downPaymentPaidInr: hasPartialDownPayment
      ? Math.round(originalDownPayment - downPaymentAmountInr)
      : undefined,
    downPaymentFullyPaid: false,
  };
}

/** Partial / complete car payment on full-payment journey (`?bank=full_payment`, no `loan_amount`). */
function parseFullPaymentPlan(searchParams: URLSearchParams) {
  if (searchParams.get("bank") !== FULL_PAYMENT_BANK_ID) {
    return null;
  }
  if (searchParams.get("loan_amount")) {
    return null;
  }

  const downPaymentRaw = searchParams.get("down_payment");
  const downPayment =
    downPaymentRaw != null && downPaymentRaw !== "" ? Number(downPaymentRaw) : NaN;
  const originalDownPayment = Number(searchParams.get("original_down_payment"));
  const hasOriginal =
    Number.isFinite(originalDownPayment) && originalDownPayment > 0;

  if (
    hasOriginal &&
    (downPaymentRaw === "0" || !Number.isFinite(downPayment) || downPayment <= 0)
  ) {
    return {
      paymentPaidInr: Math.round(originalDownPayment),
      amountRemainingInr: 0,
    };
  }

  if (!hasOriginal || !Number.isFinite(downPayment) || downPayment <= 0) {
    return null;
  }

  const amountRemainingInr = Math.round(downPayment);
  if (originalDownPayment <= amountRemainingInr) {
    return null;
  }

  return {
    paymentPaidInr: Math.round(originalDownPayment - amountRemainingInr),
    amountRemainingInr,
  };
}

/** ACKO Drive + self finance: partial or full down payment. Full payment: any instalment paid. */
function shouldHideModifyBooking(
  confirmedLoanPlan: ReturnType<typeof parseConfirmedLoanPlan>,
  fullPaymentPlan: ReturnType<typeof parseFullPaymentPlan>,
): boolean {
  if (confirmedLoanPlan != null) {
    if (confirmedLoanPlan.downPaymentFullyPaid) return true;
    if ((confirmedLoanPlan.downPaymentPaidInr ?? 0) > 0) return true;
  }
  if ((fullPaymentPlan?.paymentPaidInr ?? 0) > 0) return true;
  return false;
}

function ManageBookingBottomSheetInner({
  open,
  onClose,
  showVehicleIdentification = false,
}: ManageBookingBottomSheetProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const confirmedLoanPlan = useMemo(
    () => parseConfirmedLoanPlan(searchParams),
    [searchParams],
  );
  const fullPaymentPlan = useMemo(
    () => parseFullPaymentPlan(searchParams),
    [searchParams],
  );

  const hideModifyBooking = useMemo(
    () => shouldHideModifyBooking(confirmedLoanPlan, fullPaymentPlan),
    [confirmedLoanPlan, fullPaymentPlan],
  );

  const modifyFeeTier = useMemo(
    () => resolveModifyBookingFeeTier(pathname),
    [pathname],
  );

  const changeSelectionDescription = useMemo(
    () => modifyBookingChangeDescription(modifyFeeTier),
    [modifyFeeTier],
  );

  const cancelBookingDescription = useMemo(
    () => modifyBookingCancelDescription(modifyFeeTier),
    [modifyFeeTier],
  );

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
        aria-labelledby="manage-booking-sheet-title"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 bg-white px-5 pb-4 pt-6">
          <div className="min-w-0 flex-1">
            <h2
              id="manage-booking-sheet-title"
              className="text-left text-[20px] font-semibold leading-7 tracking-[-0.1px] text-[#121212]"
            >
              Your booking
            </h2>
            <p className="mt-1 text-sm font-normal leading-5 text-[#4b4b4b]">
              Booking ID: {DEMO_BOOKING_ID}
            </p>
          </div>
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
          className={`${BOTTOM_SHEET_SCROLL_BODY_CLASS} px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2`}
        >
          <div className="flex flex-col gap-8">
          <ManageBookingCarCard showVehicleIdentification={showVehicleIdentification} />

          <section aria-labelledby="manage-booking-payment-heading">
            <h3
              id="manage-booking-payment-heading"
              className="mb-4 text-base font-medium leading-6 text-[#121212]"
            >
              Payment summary
            </h3>
            {confirmedLoanPlan ? (
              <ChooseLoanPaymentSummaryCard
                loanAmountInr={confirmedLoanPlan.loanAmountInr}
                downPaymentAmountInr={confirmedLoanPlan.downPaymentAmountInr}
                downPaymentPaidInr={confirmedLoanPlan.downPaymentPaidInr}
                downPaymentFullyPaid={confirmedLoanPlan.downPaymentFullyPaid}
              />
            ) : (
              <PaymentSummaryCard
                paymentPaidInr={fullPaymentPlan?.paymentPaidInr}
                amountRemainingInr={fullPaymentPlan?.amountRemainingInr}
              />
            )}
          </section>

          {!hideModifyBooking ? (
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
                  description={changeSelectionDescription}
                />
                <hr className="border-0 border-t border-dashed border-[#e8e8e8]" />
                <ModifyBookingActionRow
                  iconSrc={cancelBookingIcon}
                  title="Cancel booking"
                  description={cancelBookingDescription}
                />
              </div>
            </section>
          ) : null}
          </div>
        </div>
      </div>
    </div>
    </BottomSheetPortal>
  );
}

/** `useSearchParams` requires a Suspense boundary for static export prerender. */
export function ManageBookingBottomSheet(props: ManageBookingBottomSheetProps) {
  return (
    <Suspense fallback={null}>
      <ManageBookingBottomSheetInner {...props} />
    </Suspense>
  );
}
