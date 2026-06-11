"use client";

import { useState } from "react";
import { ChevronUp } from "lucide-react";

import { BOOKING_PAYMENT_SUMMARY_INR } from "@/lib/payment-summary-demo";

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(amount)));
}

/** Demo payment figures — Figma 2486:11207 */
export const PAYMENT_SUMMARY = {
  ackoDrivePrice: formatInr(BOOKING_PAYMENT_SUMMARY_INR.ackoDrivePriceInr),
  onRoadPrice: formatInr(BOOKING_PAYMENT_SUMMARY_INR.onRoadPriceInr),
  ackoDriveDiscount: `-${formatInr(BOOKING_PAYMENT_SUMMARY_INR.ackoDriveDiscountInr)}`,
  bookingAmountPaid: formatInr(BOOKING_PAYMENT_SUMMARY_INR.bookingAmountPaidInr),
  amountToPay: formatInr(BOOKING_PAYMENT_SUMMARY_INR.amountToPayInr),
} as const;

export type PaymentSummaryCardProps = {
  /** Instalments received toward the car / full-payment commitment (excludes booking lock). */
  paymentPaidInr?: number;
  /** Remaining due before the commitment is complete. */
  amountRemainingInr?: number;
};

/**
 * ACKO Drive price, booking amount paid, and amount to pay — shared by payment default hero
 * and manage-booking sheet. Pass `paymentPaidInr` + `amountRemainingInr` for partial full payment.
 */
export function PaymentSummaryCard({
  paymentPaidInr,
  amountRemainingInr,
}: PaymentSummaryCardProps = {}) {
  const [priceBreakdownOpen, setPriceBreakdownOpen] = useState(false);
  const showPaymentPaidRow =
    paymentPaidInr != null && paymentPaidInr > 0;
  const showRemainingFooter =
    amountRemainingInr != null &&
    amountRemainingInr > 0 &&
    showPaymentPaidRow;

  return (
    <div className="overflow-hidden rounded-2xl bg-white card-elevated">
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
          <span className="text-sm leading-5 text-[#121212]">Paid so far</span>
          <span className="text-sm font-medium leading-5 text-[#121212]">
            {PAYMENT_SUMMARY.bookingAmountPaid}
          </span>
        </div>

        {showPaymentPaidRow ? (
          <>
            <hr className="my-4 border-0 border-t border-dashed border-[#e8e8e8]" />
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm leading-5 text-[#121212]">Amount paid</span>
              <span className="text-sm font-medium leading-5 text-[#121212]">
                {formatInr(paymentPaidInr)}
              </span>
            </div>
          </>
        ) : null}
      </div>

      {showRemainingFooter || !showPaymentPaidRow ? (
        <div className="flex items-center justify-between gap-2 bg-[#f5f5f5] px-4 py-4">
          <span className="text-base font-medium leading-6 text-[#121212]">Amount to pay</span>
          <span className="text-base font-medium leading-6 text-[#121212]">
            {showRemainingFooter
              ? formatInr(amountRemainingInr!)
              : PAYMENT_SUMMARY.amountToPay}
          </span>
        </div>
      ) : null}
    </div>
  );
}
