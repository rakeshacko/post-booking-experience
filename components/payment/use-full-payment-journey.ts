"use client";

import { useSearchParams } from "next/navigation";

import { appendFullPaymentBankQuery, FULL_PAYMENT_BANK_ID } from "@/lib/paymentUrls";

/** Reads `?bank=full_payment` and builds hrefs that preserve the full-payment journey. */
export function useFullPaymentJourney() {
  const searchParams = useSearchParams();
  const bank = searchParams.get("bank");
  const isFullPayment = bank === FULL_PAYMENT_BANK_ID;

  const withBank = (path: string) =>
    appendFullPaymentBankQuery(path, isFullPayment ? FULL_PAYMENT_BANK_ID : null);

  return { isFullPayment, withBank };
}
