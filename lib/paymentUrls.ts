/** Booking lock amount on `/payment` without `down_payment` (read-only checkout). */
export const BOOKING_LOCK_AMOUNT_INR = 10_000;

/** Query `bank` value for full-payment checkout and success redirects. */
export const FULL_PAYMENT_BANK_ID = "full_payment";

/** Query flag on mock checkout — full-payment insurance premium (fixed amount). */
export const INSURANCE_PAYMENT_KIND = "insurance";

/** Optional query context preserved across insurance premium screens. */
export type InsuranceJourneyQuery = {
  bank?: string | null;
  loanAmount?: string | null;
};

function appendInsuranceJourneyQuery(
  q: URLSearchParams,
  params?: InsuranceJourneyQuery,
): void {
  if (params?.bank) {
    q.set("bank", params.bank);
  } else if (!params?.loanAmount) {
    q.set("bank", FULL_PAYMENT_BANK_ID);
  }
  if (params?.loanAmount) q.set("loan_amount", params.loanAmount);
}

/**
 * Builds `/payment?bank=full_payment&down_payment=…` — mock checkout for full payment (instalments demo).
 */
export function buildFullPaymentCheckoutHref(
  amountDue: string,
  originalFullPaymentInr?: string | null,
): string {
  const q = new URLSearchParams();
  q.set("bank", FULL_PAYMENT_BANK_ID);
  q.set("down_payment", amountDue);
  if (
    originalFullPaymentInr != null &&
    originalFullPaymentInr !== "" &&
    originalFullPaymentInr !== amountDue
  ) {
    q.set("original_down_payment", originalFullPaymentInr);
  }
  return `/payment?${q.toString()}`;
}

/**
 * Builds `/payment/pay-full-payment?…` — action screen after a partial full-payment instalment.
 */
export function buildPayFullPaymentHref(
  remainingInr: number,
  originalFullPaymentInr?: number | null,
): string {
  const q = new URLSearchParams();
  q.set("bank", FULL_PAYMENT_BANK_ID);
  const rem = Math.round(remainingInr);
  q.set("down_payment", String(rem));
  const orig =
    originalFullPaymentInr != null && Number.isFinite(originalFullPaymentInr)
      ? Math.round(originalFullPaymentInr)
      : null;
  if (orig != null && orig > 0 && orig !== rem) {
    q.set("original_down_payment", String(orig));
  }
  return `/payment/pay-full-payment?${q.toString()}`;
}

/** Post–payment setup hero (`/payment/down-payment-insurance-setup`). */
export function buildInsuranceSetupHref(
  bank: string | null,
  loanAmount?: string | null,
): string {
  const q = new URLSearchParams();
  if (bank === FULL_PAYMENT_BANK_ID) {
    q.set("bank", FULL_PAYMENT_BANK_ID);
  } else if (bank) {
    q.set("bank", bank);
  }
  if (loanAmount) q.set("loan_amount", loanAmount);
  const qs = q.toString();
  return qs ? `/payment/down-payment-insurance-setup?${qs}` : "/payment/down-payment-insurance-setup";
}

/** Loan disbursed success ack — between down-payment setup and insurance prep. */
export function buildLoanDisbursementReceivedHref(loanAmount?: string | null): string {
  if (!loanAmount) return "/payment/loan-disbursement-received";
  const q = new URLSearchParams();
  q.set("loan_amount", loanAmount);
  return `/payment/loan-disbursement-received?${q.toString()}`;
}

/** Prompt to pay fixed insurance premium before car insurance prep. */
export function buildPayInsurancePremiumHref(params?: InsuranceJourneyQuery): string {
  const q = new URLSearchParams();
  appendInsuranceJourneyQuery(q, params);
  const qs = q.toString();
  return qs ? `/payment/pay-insurance-premium?${qs}` : "/payment/pay-insurance-premium";
}

/** Mock checkout for insurance premium (fixed ₹37,000). */
export function buildInsurancePremiumCheckoutHref(
  insuranceAmountInr: number,
  params?: InsuranceJourneyQuery,
): string {
  const q = new URLSearchParams();
  appendInsuranceJourneyQuery(q, params);
  q.set("down_payment", String(Math.round(insuranceAmountInr)));
  q.set("payment_kind", INSURANCE_PAYMENT_KIND);
  return `/payment?${q.toString()}`;
}

/** After insurance premium mock checkout — ack before car insurance prep. */
export function buildInsurancePremiumSuccessHref(
  paidInr: number,
  params?: InsuranceJourneyQuery,
): string {
  const q = new URLSearchParams();
  appendInsuranceJourneyQuery(q, params);
  q.set("paid", String(Math.round(paidInr)));
  return `/payment/insurance-premium-success?${q.toString()}`;
}

/** Post–insurance premium payment — “We're insuring your car” hero. */
export function buildCarDeliveryInsurancePrepHref(params?: InsuranceJourneyQuery): string {
  const q = new URLSearchParams();
  const bank = params?.bank;
  if (bank === FULL_PAYMENT_BANK_ID) {
    q.set("bank", FULL_PAYMENT_BANK_ID);
  } else if (bank) {
    q.set("bank", bank);
  }
  if (params?.loanAmount) q.set("loan_amount", params.loanAmount);
  const qs = q.toString();
  return qs ? `/payment/car-delivery-insurance-prep?${qs}` : "/payment/car-delivery-insurance-prep";
}

/** Appends `bank=full_payment` for downstream delivery screens in the full-payment journey. */
export function appendFullPaymentBankQuery(path: string, bank: string | null): string {
  if (bank !== FULL_PAYMENT_BANK_ID) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}bank=${encodeURIComponent(FULL_PAYMENT_BANK_ID)}`;
}

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
