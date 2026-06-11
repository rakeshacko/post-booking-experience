"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Legacy — interstitial removed; the choose screen hands off straight to the
 * full payment action turn.
 */
export default function FullPaymentOptionConfirmedPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/payment/full-payment-confirmed");
  }, [router]);

  return null;
}
