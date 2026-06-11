"use client";

import {
  formatModifySelectionInr,
  formatModifySelectionInrSigned,
  type ModifySelectionReviewPaySummary,
} from "@/lib/modify-selection-review-pay-content";

export const MODIFY_SELECTION_BOOKING_AMOUNT_SECTION_ID = "modify-selection-booking-amount";

export const MODIFY_SELECTION_BOOKING_AMOUNT_SUMMARY_HEADING = "Booking amount summary";

type ModifySelectionReviewBookingAmountCardProps = {
  summary: ModifySelectionReviewPaySummary;
  sectionRef?: React.RefObject<HTMLElement | null>;
};

/**
 * Booking amount breakdown — Figma 2699:9434 (section header + card, mirrors price summary).
 */
export function ModifySelectionReviewBookingAmountCard({
  summary,
  sectionRef,
}: ModifySelectionReviewBookingAmountCardProps) {
  return (
    <section
      id={MODIFY_SELECTION_BOOKING_AMOUNT_SECTION_ID}
      ref={sectionRef}
      className="mt-8 scroll-mt-14"
      aria-labelledby="modify-selection-booking-amount-summary-heading"
    >
      <h2
        id="modify-selection-booking-amount-summary-heading"
        className="text-base font-medium leading-6 text-[#121212]"
      >
        {MODIFY_SELECTION_BOOKING_AMOUNT_SUMMARY_HEADING}
      </h2>

      <div className="mt-3 overflow-hidden rounded-2xl bg-white card-elevated">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm leading-5 text-[#121212]">New booking amount</span>
            <span className="text-sm font-medium leading-5 text-[#121212]">
              {formatModifySelectionInr(summary.newBookingAmountInr)}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <span className="text-sm leading-5 text-[#121212]">Booking amount paid</span>
            <span className="text-sm font-medium leading-5 text-[#121212]">
              {formatModifySelectionInrSigned(-summary.bookingAmountPaidInr)}
            </span>
          </div>

          {summary.changeSelectionFeeInr > 0 ? (
            <div className="mt-4 flex items-center justify-between gap-2">
              <span className="text-sm leading-5 text-[#121212]">One-time change fee</span>
              <span className="text-sm font-medium leading-5 text-[#121212]">
                {formatModifySelectionInr(summary.changeSelectionFeeInr)}
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2 bg-[#f5f5f5] px-4 py-4">
          <span className="text-base font-medium leading-6 text-[#121212]">Booking amount to pay</span>
          <span className="text-base font-semibold leading-6 text-[#121212]">
            {formatModifySelectionInr(summary.bookingAmountToPayInr)}
          </span>
        </div>
      </div>
    </section>
  );
}
