import {
  CANCEL_BOOKING_REFUND_AMOUNT_LABEL,
  CANCEL_BOOKING_REFUND_BOOKING_AMOUNT_LABEL,
  CANCEL_BOOKING_REFUND_CANCELLATION_FEE_LABEL,
  CANCEL_BOOKING_REFUND_TIMELINE,
  cancelBookingRefundAmountInr,
  cancelBookingRefundBookingAmountInr,
  cancelBookingRefundCancellationFeeDisplay,
  formatCancelBookingInr,
} from "@/lib/cancel-booking-content";

/**
 * Refund breakdown — Figma Post-booking-experience / node 2711:17474.
 */
export function CancelBookingRefundSummaryCard() {
  const bookingAmount = cancelBookingRefundBookingAmountInr();
  const refundAmount = cancelBookingRefundAmountInr();

  return (
    <div className="overflow-hidden rounded-2xl bg-white card-elevated">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm leading-5 text-[#121212]">
            {CANCEL_BOOKING_REFUND_BOOKING_AMOUNT_LABEL}
          </p>
          <p className="shrink-0 text-sm font-medium leading-5 text-[#121212]">
            {formatCancelBookingInr(bookingAmount)}
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-sm leading-5 text-[#121212]">
            {CANCEL_BOOKING_REFUND_CANCELLATION_FEE_LABEL}
          </p>
          <p className="shrink-0 text-sm font-medium leading-5 text-[#121212]">
            {cancelBookingRefundCancellationFeeDisplay()}
          </p>
        </div>
      </div>
      <div className="bg-[#f5f5f5] px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <p className="text-base font-medium leading-6 text-[#121212]">
            {CANCEL_BOOKING_REFUND_AMOUNT_LABEL}
          </p>
          <p className="shrink-0 text-base font-medium leading-6 text-[#121212]">
            {formatCancelBookingInr(refundAmount)}
          </p>
        </div>
        <p className="mt-1 text-xs leading-[18px] text-[#4b4b4b]">
          {CANCEL_BOOKING_REFUND_TIMELINE}
        </p>
      </div>
    </div>
  );
}
