"use client";

import { useSearchParams } from "next/navigation";

import { KycBookingConfirmedScreen } from "@/components/kyc/KycBookingConfirmedScreen";
import { BOOKING_LOCK_AMOUNT_INR } from "@/lib/paymentUrls";

function parsePositiveInt(raw: string | null): number | null {
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

export function KycBookingConfirmedPageClient() {
  const searchParams = useSearchParams();
  const variant = searchParams.get("source") === "payment" ? "payment" : "default";
  const paidAmountInr =
    parsePositiveInt(searchParams.get("paid")) ?? BOOKING_LOCK_AMOUNT_INR;

  return (
    <KycBookingConfirmedScreen
      variant={variant}
      paidAmountInr={variant === "payment" ? paidAmountInr : undefined}
    />
  );
}
