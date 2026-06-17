"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ConciergeTurnShell } from "@/components/concierge/ConciergeTurnShell";
import { FinanceStatusTimeline } from "@/components/payment/FinanceStatusTimeline";
import { bankForQueryParam } from "@/components/payment/acko-drive-finance-bank";
import {
  ACKO_LOAN_DOWN_PAYMENT_INR,
  BANK_DISBURSEMENT_INR,
} from "@/components/payment/loan-amount-demo-constants";
import { isAckoOnly, readDealerVisibility } from "@/lib/dealer-visibility";
import { buildDownPaymentCheckoutHref } from "@/lib/paymentUrls";
import { cn } from "@/lib/utils";

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(amount)));
}

/**
 * Digital agreement — the tripartite loan agreement (you, the bank, and the
 * party the loan is paid to) is signed in-app, replacing the rep-collected
 * physical signature that used to block disbursement. Carries the locked loan +
 * down payment to checkout. Where a bank can't e-sign, the fallback note sets
 * expectations and the live status still shows the in-person step.
 */
export function LoanAgreementScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bankId = searchParams.get("bank");
  const bank = useMemo(() => bankForQueryParam(bankId), [bankId]);

  const loanAmount = searchParams.get("loan_amount");
  const downPayment = useMemo(() => {
    const n = Number(searchParams.get("down_payment"));
    return Number.isFinite(n) && n > 0 ? n : ACKO_LOAN_DOWN_PAYMENT_INR;
  }, [searchParams]);
  const loanInr = useMemo(() => {
    const n = Number(loanAmount);
    return Number.isFinite(n) && n > 0 ? n : BANK_DISBURSEMENT_INR;
  }, [loanAmount]);

  const [ackoOnly, setAckoOnly] = useState(false);
  const [agreed, setAgreed] = useState(false);
  useEffect(() => {
    setAckoOnly(isAckoOnly(readDealerVisibility()));
  }, []);

  const recipient = ackoOnly ? "AckoDrive" : "the dealer";

  const sign = useCallback(() => {
    router.push(buildDownPaymentCheckoutHref(bankId, loanAmount ?? String(loanInr), downPayment));
  }, [router, bankId, loanAmount, loanInr, downPayment]);

  return (
    <ConciergeTurnShell
      says={[
        "One quick signature, Sharath.",
        `This is the loan agreement between you, ${bank.name}, and ${recipient}. Sign it here — no rep visit, no paperwork — and the bank can release your loan.`,
      ]}
      artifact={
        <div className="flex flex-col gap-4">
          <AgreementCard
            bankName={bank.name}
            recipient={recipient}
            loanInr={loanInr}
            downPayment={downPayment}
            agreed={agreed}
            onAgreedChange={setAgreed}
          />
          <FinanceStatusTimeline current="agreement" />
        </div>
      }
      replies={[
        {
          label: "Sign digitally",
          onClick: sign,
          echo: "Agreement signed",
          disabled: !agreed,
        },
      ]}
      callLabel="Want to read it with me? I can call you"
      manageShowVehicleIdentification
    />
  );
}

/* ------------------------------------------------------------------ */

function AgreementCard({
  bankName,
  recipient,
  loanInr,
  downPayment,
  agreed,
  onAgreedChange,
}: {
  bankName: string;
  recipient: string;
  loanInr: number;
  downPayment: number;
  agreed: boolean;
  onAgreedChange: (value: boolean) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white card-elevated">
      <div className="flex items-center gap-2 border-b border-[#f0f0f0] px-4 py-3">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"
            stroke="#121212"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M14 3v5h5" stroke="#121212" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
        <span className="text-sm font-semibold text-[#121212]">Loan agreement</span>
        <span className="ml-auto rounded-full bg-[#eef6ff] px-2 py-0.5 text-[10.5px] font-medium text-[#1b73e8]">
          Digital · e-sign
        </span>
      </div>

      {/* Three parties */}
      <div className="flex items-stretch gap-2 px-4 pt-3.5">
        <PartyChip label="You" sub="Sharath" />
        <PlusDot />
        <PartyChip label={bankName} sub="Lender" />
        <PlusDot />
        <PartyChip label={recipient} sub="Receives the loan" />
      </div>

      {/* Locked terms */}
      <div className="mx-4 mt-3.5 rounded-xl bg-[#fafafa] px-4 py-3 tabular-nums">
        <TermRow label="Loan amount" value={formatInr(loanInr)} />
        <TermRow label="Your down payment" value={formatInr(downPayment)} strong />
        <p className="mt-2 text-[11px] leading-[15px] text-[#757575]">
          These amounts are locked — signing fixes the split so the bank and {recipient} can act on it.
        </p>
      </div>

      {/* Agree */}
      <label className="flex cursor-pointer items-start gap-3 px-4 py-4">
        <span
          className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
            agreed ? "border-[#6841e6] bg-[#6841e6]" : "border-[#c2c2c2] bg-white",
          )}
        >
          {agreed ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M5 12.5l4.5 4.5L19 7"
                stroke="#fff"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </span>
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onAgreedChange(e.target.checked)}
          className="sr-only"
        />
        <span className="text-[13px] leading-[18px] text-[#4b4b4b]">
          I&apos;ve read and agree to the loan agreement and its terms.
        </span>
      </label>

      <div className="border-t border-dashed border-[#eee] px-4 py-3">
        <p className="text-[11px] leading-[16px] text-[#8f8e92]">
          <span className="font-medium text-[#757575]">If {bankName} can&apos;t e-sign:</span> I&apos;ll
          set up an in-person signing instead and keep this status updated — you won&apos;t be left
          guessing.
        </p>
      </div>
    </div>
  );
}

function PartyChip({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center rounded-xl border border-[#eee] bg-[#fafafa] px-2 py-2.5 text-center">
      <span className="truncate text-xs font-semibold leading-4 text-[#121212]">{label}</span>
      <span className="truncate text-[10.5px] leading-[14px] text-[#8f8e92]">{sub}</span>
    </div>
  );
}

function PlusDot() {
  return <span className="flex items-center text-sm font-medium text-[#c2c2c2]">+</span>;
}

function TermRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-sm leading-5 text-[#4b4b4b]">{label}</span>
      <span
        className={cn(
          "text-sm leading-5 tabular-nums",
          strong ? "font-semibold text-[#121212]" : "font-medium text-[#121212]",
        )}
      >
        {value}
      </span>
    </div>
  );
}
