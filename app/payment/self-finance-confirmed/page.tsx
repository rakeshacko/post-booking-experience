"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Legacy — interstitial removed; the choose screen hands off straight to the
 * self-finance action turn.
 */
export default function SelfFinanceConfirmedPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/payment/self-finance-action");
  }, [router]);

  return null;
}
