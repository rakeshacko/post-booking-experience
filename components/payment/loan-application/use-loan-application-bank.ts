"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { bankForQueryParam } from "@/components/payment/acko-drive-finance-bank";

export function useLoanApplicationBank() {
  const searchParams = useSearchParams();
  const bankId = searchParams.get("bank");
  const bank = useMemo(() => bankForQueryParam(bankId), [bankId]);
  return { bankId: bank.id, bank };
}
