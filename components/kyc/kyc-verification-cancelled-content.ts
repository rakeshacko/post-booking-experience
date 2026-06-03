import { BOOKING_LOCK_AMOUNT_INR } from "@/lib/paymentUrls";

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const KYC_VERIFICATION_CANCELLED_REFUND_INR = BOOKING_LOCK_AMOUNT_INR;

export const KYC_VERIFICATION_CANCELLED_COPY = {
  headline: "Your booking has been cancelled",
  subline: `We couldn't verify your documents after your retry. Your booking amount of ${formatInr(
    KYC_VERIFICATION_CANCELLED_REFUND_INR,
  )} will be refunded to your original payment source within 5–7 business days.`,
  infoBox:
    "You'll receive a confirmation once the refund is initiated. No further action is needed from you.",
  ctaLabel: "Done",
  doneHref: "/quote",
} as const;
