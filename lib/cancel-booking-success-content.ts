import { BOOKING_LOCK_AMOUNT_INR } from "@/lib/paymentUrls";

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const CANCEL_BOOKING_SUCCESS_COPY = {
  headline: "Your booking has been cancelled",
  subline: "No cancellation fee applied",
  infoBox: `Your full booking amount of ${formatInr(
    BOOKING_LOCK_AMOUNT_INR,
  )} will be refunded to your account in 5-7 business days.`,
  ctaLabel: "Done",
  doneHref: "/quote",
} as const;
