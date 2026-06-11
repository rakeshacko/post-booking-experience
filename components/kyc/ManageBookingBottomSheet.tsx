"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";

import arrowRightIcon from "@/assets/Arrow_right.svg";
import changeSelectionIcon from "@/assets/change selection.svg";
import cancelBookingIcon from "@/assets/cancel booking.svg";
import { BookingCarSummaryCard } from "@/components/kyc/BookingCarSummaryCard";
import { DEMO_BOOKING_ID } from "@/components/kyc/booking-car-card-content";
import {
  activeBookingCardDetails,
  activeBookingCarCutoutSrc,
  readActiveBookingSnapshot,
} from "@/lib/active-booking-snapshot";
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
  isCancelNoChargesFlow,
  isModifyNoChargesFlow,
  isModifyWithChargesFlow,
} from "@/lib/experience-flow";
import {
  isChangeSelectionAvailablePhase,
  JOURNEY_PATHS,
  resolveJourneyPhase,
} from "@/lib/journey-routes";
import {
  readPostLockChangesUsed,
  writeChangeEntryStage,
} from "@/lib/change-policy";
import {
  modifyBookingCancelDescription,
  modifyBookingChangeDescription,
  resolveModifyBookingFeeTier,
} from "@/lib/manage-booking-modify";
import {
  BOOKING_LOCK_AMOUNT_INR,
  FULL_PAYMENT_BANK_ID,
  INSURANCE_PAYMENT_KIND,
} from "@/lib/paymentUrls";
import { cn } from "@/lib/utils";

/** Keeps parity with other bottom sheets in the app */
const SHEET_TRANSITION_MS = 280;

type ModifyBookingActionRowProps = {
  iconSrc: string;
  title: string;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
};

function ModifyBookingActionRow({
  iconSrc,
  title,
  description,
  onClick,
  disabled = false,
}: ModifyBookingActionRowProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={cn(
        "flex w-full items-start gap-4 px-[15px] py-[15px] text-left transition-colors",
        disabled
          ? "cursor-not-allowed opacity-60"
          : "hover:bg-[#fafafa] active:bg-[#f5f5f5]",
      )}
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

export type ManageBookingSectionsProps = {
  onClose: () => void;
  showVehicleIdentification?: boolean;
  /** `overlay` — cards sit on the page surface (elevation); `sheet` — hairline borders on white. */
  surface?: "sheet" | "overlay";
  /** Extra section rendered between the payment summary and “Make a change” (e.g. receipts). */
  beforeChange?: React.ReactNode;
};

/**
 * The manage-booking content (car card, payment summary, make-a-change) with
 * all its policy logic — shared by the bottom sheet and the concierge zoom
 * overlay. Requires a Suspense boundary (`useSearchParams`).
 */
export function ManageBookingSections({
  onClose,
  showVehicleIdentification = false,
  surface = "sheet",
  beforeChange,
}: ManageBookingSectionsProps) {
  const router = useRouter();
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

  const modifyFeeTier = useMemo(
    () => resolveModifyBookingFeeTier(pathname),
    [pathname],
  );

  /** Post-lock changes already used (policy §1.9 — exactly one allowed). */
  const [changesUsed, setChangesUsed] = useState(0);
  useEffect(() => {
    setChangesUsed(readPostLockChangesUsed());
  }, []);

  const changeSelectionDescription = useMemo(() => {
    if (modifyFeeTier === "free") return modifyBookingChangeDescription(modifyFeeTier);
    return changesUsed >= 1
      ? "Change used — another means cancel & rebook"
      : "One change — ₹5,000 plus any price difference";
  }, [modifyFeeTier, changesUsed]);

  const changeSelectionEnabled = useMemo(() => {
    if (isCancelNoChargesFlow()) return false;
    if (isModifyNoChargesFlow()) return true;
    if (isModifyWithChargesFlow()) {
      return isChangeSelectionAvailablePhase(resolveJourneyPhase(pathname));
    }
    // Express/standard — policy grants one post-lock change to every booking.
    return true;
  }, [pathname]);

  const changeSelectionClickable = useMemo(() => {
    if (isCancelNoChargesFlow()) return false;
    return changeSelectionEnabled;
  }, [changeSelectionEnabled]);

  const cancelBookingDescription = useMemo(
    () => modifyBookingCancelDescription(modifyFeeTier),
    [modifyFeeTier],
  );

  /** Policy §7 — cancellation is the customer's right at every stage; 50% of total paid post-confirmation. */
  const totalPaidInr = useMemo(() => {
    const dpPaid = Math.max(0, confirmedLoanPlan?.downPaymentPaidInr ?? 0);
    const fullPaid = Math.max(0, fullPaymentPlan?.paymentPaidInr ?? 0);
    return BOOKING_LOCK_AMOUNT_INR + dpPaid + fullPaid;
  }, [confirmedLoanPlan, fullPaymentPlan]);

  const onChangeSelection = useCallback(() => {
    onClose();
    const stage = modifyFeeTier === "free" ? "pre" : "post";
    // Second post-lock change = cancellation + rebook (policy §1.9).
    if (stage === "post" && readPostLockChangesUsed() >= 1) {
      router.push(
        `${JOURNEY_PATHS.kyc.cancelBooking}?paid=${totalPaidInr}&stage=post&reason=second-change`,
      );
      return;
    }
    writeChangeEntryStage(stage);
    router.push(JOURNEY_PATHS.kyc.modifySelection);
  }, [onClose, router, modifyFeeTier, totalPaidInr]);

  const onCancelBooking = useCallback(() => {
    onClose();
    const stage = modifyFeeTier === "free" ? "pre" : "post";
    router.push(`${JOURNEY_PATHS.kyc.cancelBooking}?paid=${totalPaidInr}&stage=${stage}`);
  }, [onClose, router, modifyFeeTier, totalPaidInr]);

  const [activeBooking, setActiveBooking] = useState<ReturnType<
    typeof readActiveBookingSnapshot
  >>(null);

  useEffect(() => {
    setActiveBooking(readActiveBookingSnapshot());
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <BookingCarSummaryCard
        showVehicleIdentification={showVehicleIdentification}
        cardDetails={
          activeBooking != null ? activeBookingCardDetails(activeBooking) : undefined
        }
        carCutoutSrc={
          activeBooking != null ? activeBookingCarCutoutSrc(activeBooking) : undefined
        }
      />

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

      {beforeChange}

      {/* Always rendered — cancellation is available at every stage (policy §7). */}
      <section aria-labelledby="manage-booking-modify-heading">
        <h3
          id="manage-booking-modify-heading"
          className="mb-4 text-base font-medium leading-6 text-[#121212]"
        >
          Make a change
        </h3>
        <div
          className={cn(
            "overflow-hidden rounded-2xl bg-white",
            surface === "overlay" ? "card-elevated" : "border border-[#e8e8e8]",
          )}
        >
          <ModifyBookingActionRow
            iconSrc={changeSelectionIcon}
            title="Change selection"
            description={changeSelectionDescription}
            onClick={changeSelectionClickable ? onChangeSelection : undefined}
          />
          <hr className="border-0 border-t border-dashed border-[#e8e8e8]" />
          <ModifyBookingActionRow
            iconSrc={cancelBookingIcon}
            title="Cancel my purchase"
            description={cancelBookingDescription}
            onClick={onCancelBooking}
          />
        </div>
      </section>
    </div>
  );
}

/** ACKO Drive + self finance: partial or full down payment. Full payment: any instalment paid. */
function ManageBookingBottomSheetInner({
  open,
  onClose,
  showVehicleIdentification = false,
}: ManageBookingBottomSheetProps) {
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
              Your car
            </h2>
            <p className="mt-1 text-sm font-normal leading-5 text-[#4b4b4b]">
              Reference ID: {DEMO_BOOKING_ID}
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
          <ManageBookingSections
            onClose={onClose}
            showVehicleIdentification={showVehicleIdentification}
          />
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
