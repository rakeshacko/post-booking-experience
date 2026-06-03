/** Demo pricing — keep in sync across loan / down-payment calculators (Figma 2111:7963). */
export const ON_ROAD_PRICE_INR = 13_73_780;
/** List / MRP before ACKO Drive discount — Figma Down payment details (2331:10371). */
export const ON_ROAD_LIST_PRICE_INR = 14_33_481;
/** ACKO Drive discount (green, negative line) — same frame. */
export const ACKO_DRIVE_DISCOUNT_INR = 69_701;
export const MIN_DOWN_PAYMENT_INR = 100_000;
/** Minimum selectable loan on choose-loan slider (₹1 lakh). */
export const MIN_LOAN_INR = 100_000;
export const SLIDER_STEP = 10_000;
export const DEFAULT_TENURE_MONTHS = 60;

/** Insurance portion of full / down payment — Figma 2331:10371 (aligned with enter-sanctioned screen). */
export const FULL_PAYMENT_INSURANCE_INR = 37_000;

/** Car portion when paying full on-road price upfront (on-road total minus insurance). */
export const FULL_PAYMENT_CAR_AMOUNT_INR = ON_ROAD_PRICE_INR - FULL_PAYMENT_INSURANCE_INR;

/** Car down payment due now — total down payment minus insurance (payable after disbursement). */
export function carDownPaymentFromTotalInr(totalDownPaymentInr: number): number {
  return Math.max(0, Math.round(totalDownPaymentInr) - FULL_PAYMENT_INSURANCE_INR);
}

/** Demo default loan disbursement when `loan_amount` is not on the URL (choose-loan default DP ₹3L). */
export const DEMO_DEFAULT_LOAN_DISBURSEMENT_INR = ON_ROAD_PRICE_INR - 300_000;

/** Demo transaction id on loan-disbursement-received (Figma). */
export const DEMO_LOAN_DISBURSEMENT_TRANSACTION_ID = "TXN9845210763";

/** Max sanctioned loan — loan-sanctioned info callout (Figma). */
export const DEMO_SANCTIONED_LOAN_MAX_INR = 2_000_000;

/** Self finance disbursement default — `/payment/enter-disbursement-amount` (slider min/max = `MIN_LOAN_INR` / `ON_ROAD_PRICE_INR`). */
export const SELF_FINANCE_LOAN_DEFAULT_INR = 1_000_000;

export const FULL_PAYMENT_CAR_DUE_LABEL = "30 May 2026";
/** Secondary line under insurance amount on full-payment breakdown. */
export const FULL_PAYMENT_INSURANCE_DUE_LINE = "Due before car registration";
