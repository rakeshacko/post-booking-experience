"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { KycBookingConfirmedScreen } from "@/components/kyc/KycBookingConfirmedScreen";
import {
  syncModifySelectionBookingSnapshot,
  type ActiveBookingSnapshot,
} from "@/lib/active-booking-snapshot";
import {
  BOOKING_LOCK_AMOUNT_INR,
  MODIFY_SELECTION_RETURN_SOURCE,
} from "@/lib/paymentUrls";

function parsePositiveInt(raw: string | null): number | null {
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

export function KycBookingConfirmedPageClient() {
  const searchParams = useSearchParams();
  const afterModifySelection =
    searchParams.get("return_source") === MODIFY_SELECTION_RETURN_SOURCE;
  const variant = searchParams.get("source") === "payment" ? "payment" : "default";
  const paidAmountInr =
    parsePositiveInt(searchParams.get("paid")) ?? BOOKING_LOCK_AMOUNT_INR;

  const [activeBooking, setActiveBooking] = useState<ActiveBookingSnapshot | null>(null);

  useLayoutEffect(() => {
    if (!afterModifySelection) {
      setActiveBooking(null);
      return;
    }
    setActiveBooking(syncModifySelectionBookingSnapshot(variant, paidAmountInr));
  }, [afterModifySelection, paidAmountInr, variant]);

  const paymentPaidInr = useMemo(
    () => (variant === "payment" ? paidAmountInr : undefined),
    [variant, paidAmountInr],
  );

  return (
    <KycBookingConfirmedScreen
      variant={variant}
      paidAmountInr={paymentPaidInr}
      afterModifySelection={afterModifySelection}
      activeBooking={activeBooking}
    />
  );
}
