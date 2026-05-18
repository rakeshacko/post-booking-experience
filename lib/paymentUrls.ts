/** Booking lock amount on `/payment` without `down_payment` (read-only checkout). */
export const BOOKING_LOCK_AMOUNT_INR = 10_000;

/**
 * Builds `/payment/pay-down-payment?…` — action screen after a partial instalment (shows remaining + CTA).
 * Pass `originalDownPaymentInr` when remaining is part of a larger commitment so the screen can show progress.
 */
export function buildPayDownPaymentHref(
  bank: string | null,
  loanAmount: string | null,
  remainingDownPaymentInr: number,
  originalDownPaymentInr?: number | null,
): string {
  const q = new URLSearchParams();
  if (bank) q.set("bank", bank);
  if (loanAmount) q.set("loan_amount", loanAmount);
  const rem = Math.round(remainingDownPaymentInr);
  q.set("down_payment", String(rem));
  const orig =
    originalDownPaymentInr != null && Number.isFinite(originalDownPaymentInr)
      ? Math.round(originalDownPaymentInr)
      : null;
  if (orig != null && orig > 0 && orig !== rem) {
    q.set("original_down_payment", String(orig));
  }
  return `/payment/pay-down-payment?${q.toString()}`;
}

/** Builds `/payment/down-payment-success?…` after mock checkout on `/payment`. */
export function buildDownPaymentSuccessHref(params: {
  bank: string | null;
  loanAmount: string | null;
  /** Full down payment commitment (unchanged across partial instalments). */
  originalDownPaymentInr: number;
  paidThisInstalment: number;
  remainingAfter: number;
}): string {
  const q = new URLSearchParams();
  if (params.bank) q.set("bank", params.bank);
  if (params.loanAmount) q.set("loan_amount", params.loanAmount);
  q.set("original_down_payment", String(Math.round(params.originalDownPaymentInr)));
  q.set("paid", String(Math.round(params.paidThisInstalment)));
  q.set("remaining", String(Math.round(params.remainingAfter)));
  return `/payment/down-payment-success?${q.toString()}`;
}

/** Self finance — after full down payment, margin money slip step (`/payment/margin-money-slip`). */
export function buildMarginMoneySlipActionHref(params: {
  bank: string | null;
  loanAmount: string | null;
  originalDownPaymentInr?: number | null;
}): string {
  const q = new URLSearchParams();
  if (params.bank) q.set("bank", params.bank);
  if (params.loanAmount) q.set("loan_amount", params.loanAmount);
  if (
    params.originalDownPaymentInr != null &&
    Number.isFinite(params.originalDownPaymentInr) &&
    params.originalDownPaymentInr > 0
  ) {
    q.set("original_down_payment", String(Math.round(params.originalDownPaymentInr)));
  }
  const qs = q.toString();
  return qs ? `/payment/margin-money-slip?${qs}` : "/payment/margin-money-slip";
}
