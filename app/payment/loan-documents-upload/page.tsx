"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

import { bankForQueryParam, loanApplicationDocumentsPath } from "@/components/payment/acko-drive-finance-bank";

function LegacyLoanDocumentsUploadRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const bank = bankForQueryParam(searchParams.get("bank"));
    router.replace(loanApplicationDocumentsPath(bank.id));
  }, [router, searchParams]);

  return null;
}

/**
 * Legacy route — redirects into the loan application wizard (documents step).
 */
export default function LoanDocumentsUploadPage() {
  return (
    <Suspense fallback={null}>
      <LegacyLoanDocumentsUploadRedirect />
    </Suspense>
  );
}
