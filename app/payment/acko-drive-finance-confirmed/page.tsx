"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Legacy — the “Payment option confirmed” interstitial broke the conversation;
 * the choose screen now hands off straight to the finance action turn.
 */
function LegacyAckoDriveFinanceConfirmedRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const bank = searchParams.get("bank");
    router.replace(
      bank
        ? `/payment/acko-drive-finance-action?bank=${encodeURIComponent(bank)}`
        : "/payment/acko-drive-finance-action",
    );
  }, [router, searchParams]);

  return null;
}

export default function AckoDriveFinanceConfirmedPage() {
  return (
    <Suspense fallback={null}>
      <LegacyAckoDriveFinanceConfirmedRedirect />
    </Suspense>
  );
}
