"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { ConciergeTurnShell } from "@/components/concierge/ConciergeTurnShell";
import { bankForQueryParam } from "@/components/payment/acko-drive-finance-bank";
import { BankSelectionBottomSheet } from "@/components/payment/BankSelectionBottomSheet";
import {
  BANK_DISBURSEMENT_INR,
  DEFAULT_TENURE_MONTHS,
} from "@/components/payment/loan-amount-demo-constants";
import { BANK_SHEET_OPTIONS } from "@/components/payment/payment-choose-assets";
import { writeConciergeEcho } from "@/lib/concierge/echo";
import { estimateMonthlyEmiInr, parseAnnualRateFromLabel } from "@/lib/loan-emi";

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(amount)));
}

/** Best-rate partner bank that isn't the one that declined. */
function pickAlternativeBank(rejectedId: string) {
  const candidates = BANK_SHEET_OPTIONS.filter((bank) => bank.id !== rejectedId);
  return [...candidates].sort(
    (a, b) => parseAnnualRateFromLabel(a.rate) - parseAnnualRateFromLabel(b.rate),
  )[0];
}

/**
 * Bank declined — the journey's most likely real-world failure, handled the
 * way every other car-buying experience doesn't: dignity first, a concrete
 * pre-approved alternative, zero rework, and the car never at risk.
 */
export function LoanRejectedScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rejected = useMemo(
    () => bankForQueryParam(searchParams.get("bank")),
    [searchParams],
  );
  const alt = useMemo(() => pickAlternativeBank(rejected.id), [rejected.id]);
  const altEmi = useMemo(
    () =>
      estimateMonthlyEmiInr(
        BANK_DISBURSEMENT_INR,
        DEFAULT_TENURE_MONTHS,
        parseAnnualRateFromLabel(alt.rate),
      ),
    [alt.rate],
  );

  const [bankSheetOpen, setBankSheetOpen] = useState(false);

  const switchToBank = useCallback(
    (bankId: string, bankName: string) => {
      writeConciergeEcho(`Switch me to ${bankName}`);
      router.push(`/payment/loan-processing?bank=${encodeURIComponent(bankId)}`);
    },
    [router],
  );

  return (
    <>
      <ConciergeTurnShell
        says={[
          `${rejected.name} said no — their loss.`,
          `It happens; bank criteria shift weekly, and it says nothing about you. ${alt.name} has you pre-approved at ${alt.rate} for the same amount, and your one free switch covers this. Nothing restarts — your application carries over, only the bank changes.`,
        ]}
        artifact={
          <div className="overflow-hidden rounded-2xl bg-white card-elevated">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#f5f5f5]">
                <Image
                  src={alt.logoSrc}
                  alt=""
                  fill
                  className="object-contain p-1.5"
                  unoptimized
                  sizes="40px"
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold leading-6 text-[#121212]">{alt.name}</p>
                <p className="mt-0.5 text-xs leading-[18px] text-[#757575]">
                  Same loan, better rate
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-[#e7f6ee] px-2.5 py-1 text-[11px] font-medium leading-4 text-[#0c7a42]">
                Pre-approved ✓
              </span>
            </div>
            <div className="border-t border-dashed border-[#ececec] px-4 py-3">
              <div className="flex items-center justify-between gap-3 py-1">
                <span className="text-sm leading-5 text-[#4b4b4b]">Interest rate</span>
                <span className="text-sm font-medium leading-5 text-[#121212]">{alt.rate}</span>
              </div>
              <div className="flex items-center justify-between gap-3 py-1">
                <span className="text-sm leading-5 text-[#4b4b4b]">Disbursement</span>
                <span className="text-sm font-medium leading-5 text-[#121212] tabular-nums">
                  {formatInr(BANK_DISBURSEMENT_INR)} — unchanged
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 py-1">
                <span className="text-sm leading-5 text-[#4b4b4b]">EMI from</span>
                <span className="text-sm font-medium leading-5 text-[#121212] tabular-nums">
                  {formatInr(altEmi)}/mo
                </span>
              </div>
            </div>
          </div>
        }
        replies={[
          {
            label: `Switch to ${alt.name} — free`,
            onClick: () => switchToBank(alt.id, alt.name),
            echo: null,
          },
          {
            label: "Show me all bank options",
            kind: "soft",
            onClick: () => setBankSheetOpen(true),
            echo: null,
          },
        ]}
        footnote="Your price lock and delivery date are untouched — the switch costs nothing"
        callLabel="Rather talk it through? I can call you"
      />
      <BankSelectionBottomSheet
        open={bankSheetOpen}
        onClose={() => setBankSheetOpen(false)}
        onConfirm={(bankId) => {
          setBankSheetOpen(false);
          switchToBank(bankId, bankForQueryParam(bankId).name);
        }}
        initialBankId={alt.id}
      />
    </>
  );
}
