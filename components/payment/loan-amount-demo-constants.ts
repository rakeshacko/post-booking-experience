/** Demo pricing — keep in sync across loan / down-payment calculators (Figma 2111:7963). */
export const ON_ROAD_PRICE_INR = 13_73_780;
/** List / MRP before ACKO Drive discount — Figma Down payment details (2331:10371). */
export const ON_ROAD_LIST_PRICE_INR = 14_33_481;
/** ACKO Drive discount (green, negative line) — same frame. */
export const ACKO_DRIVE_DISCOUNT_INR = 69_701;
export const MIN_DOWN_PAYMENT_INR = 100_000;
export const SLIDER_STEP = 10_000;
export const DEFAULT_TENURE_MONTHS = 60;

/** Insurance portion of full / down payment — Figma 2331:10371 (aligned with enter-sanctioned screen). */
export const FULL_PAYMENT_INSURANCE_INR = 37_000;

/** Car portion when paying full on-road price upfront (on-road total minus insurance). */
export const FULL_PAYMENT_CAR_AMOUNT_INR = ON_ROAD_PRICE_INR - FULL_PAYMENT_INSURANCE_INR;

/** Due-date copy on full-payment amount breakdown. */
export const FULL_PAYMENT_CAR_DUE_LABEL = "30 May 2026";
/** Secondary line under insurance amount on full-payment breakdown. */
export const FULL_PAYMENT_INSURANCE_DUE_LINE = "Due before car registration";
