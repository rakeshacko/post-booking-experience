"use client";

import { useState } from "react";
import { ChevronUp } from "lucide-react";

import {
  ACKO_DRIVE_DISCOUNT_INR,
  ON_ROAD_LIST_PRICE_INR,
  ON_ROAD_PRICE_INR,
} from "@/components/payment/loan-amount-demo-constants";
import { BOOKING_PAYMENT_SUMMARY_INR } from "@/lib/payment-summary-demo";

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(amount)));
}

export type ChooseLoanPaymentSummaryCardProps = {
  loanAmountInr: number;
  /** Full or remaining down payment — footer amount. */
  downPaymentAmountInr: number;
  /** When set, shows a “Down payment paid” row; with partial pay, footer shows remaining. */
  downPaymentPaidInr?: number;
  /** Hides the footer when the full down payment is received. */
  downPaymentFullyPaid?: boolean;
};

/**
 * Payment summary for choose-loan — Figma choose-loan flow.
 * ACKO Drive price breakdown, booking paid, selected loan, and down payment due.
 */
export function ChooseLoanPaymentSummaryCard({
  loanAmountInr,
  downPaymentAmountInr,
  downPaymentPaidInr,
  downPaymentFullyPaid = false,
}: ChooseLoanPaymentSummaryCardProps) {
  const [priceBreakdownOpen, setPriceBreakdownOpen] = useState(false);
  const showDownPaymentPaidRow =
    downPaymentPaidInr != null && downPaymentPaidInr > 0;
  const showRemainingFooter = showDownPaymentPaidRow && !downPaymentFullyPaid;

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
            {formatInr(ON_ROAD_PRICE_INR)}
          </span>
        </button>

        {priceBreakdownOpen ? (
          <div className="mt-3 rounded-lg bg-[#f5f5f5] px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs leading-[18px] text-[#4b4b4b]">On-road price</span>
              <span className="text-xs font-medium leading-[18px] text-[#121212]">
                {formatInr(ON_ROAD_LIST_PRICE_INR)}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-xs leading-[18px] text-[#4b4b4b]">ACKO Drive discount</span>
              <span className="text-xs font-medium leading-[18px] text-[#0fa457]">
                -{formatInr(ACKO_DRIVE_DISCOUNT_INR)}
              </span>
            </div>
          </div>
        ) : null}

        <hr className="my-4 border-0 border-t border-dashed border-[#e8e8e8]" />

        <div className="flex items-center justify-between gap-2">
          <span className="text-sm leading-5 text-[#121212]">Booking amount paid</span>
          <span className="text-sm font-medium leading-5 text-[#121212]">
            {formatInr(BOOKING_PAYMENT_SUMMARY_INR.bookingAmountPaidInr)}
          </span>
        </div>

        <hr className="my-4 border-0 border-t border-dashed border-[#e8e8e8]" />

        <div className="flex items-center justify-between gap-2">
          <span className="text-sm leading-5 text-[#121212]">Loan amount</span>
          <span className="text-sm font-medium leading-5 text-[#121212]">
            {formatInr(loanAmountInr)}
          </span>
        </div>

        {showDownPaymentPaidRow ? (
          <>
            <hr className="my-4 border-0 border-t border-dashed border-[#e8e8e8]" />
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm leading-5 text-[#121212]">Down payment paid</span>
              <span className="text-sm font-medium leading-5 text-[#121212]">
                {formatInr(downPaymentPaidInr)}
              </span>
            </div>
          </>
        ) : null}
      </div>

      {showRemainingFooter || !showDownPaymentPaidRow ? (
        <div className="flex items-center justify-between gap-2 bg-[#f5f5f5] px-4 py-4">
          <span className="text-base font-medium leading-6 text-[#121212]">
            {showRemainingFooter ? "Remaining down payment" : "Down payment amount"}
          </span>
          <span className="text-base font-medium leading-6 text-[#121212]">
            {formatInr(downPaymentAmountInr)}
          </span>
        </div>
      ) : null}
    </div>
  );
}
