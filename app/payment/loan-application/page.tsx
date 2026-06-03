"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

import { bankForQueryParam } from "@/components/payment/acko-drive-finance-bank";
import { loanApplicationEntryPath } from "@/lib/loan-application-urls";

function LoanApplicationIndexRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const bank = bankForQueryParam(searchParams.get("bank"));
    router.replace(loanApplicationEntryPath(bank.id));
  }, [router, searchParams]);

  return null;
}

export default function LoanApplicationIndexPage() {
  return (
    <Suspense fallback={null}>
      <LoanApplicationIndexRedirect />
    </Suspense>
  );
}
