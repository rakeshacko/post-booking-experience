"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ConciergeTurnShell } from "@/components/concierge/ConciergeTurnShell";
import { FinanceStatusTimeline } from "@/components/payment/FinanceStatusTimeline";
import { bankForQueryParam } from "@/components/payment/acko-drive-finance-bank";
import {
  BANK_DISBURSEMENT_INR,
  BOOKING_AMOUNT_PAID_INR,
  FULL_PAYMENT_INSURANCE_INR,
  MIN_LOAN_INR,
  ON_ROAD_PRICE_INR,
  SLIDER_STEP,
  cashDownPaymentDueInr,
} from "@/components/payment/loan-amount-demo-constants";
import { isAckoOnly, readDealerVisibility } from "@/lib/dealer-visibility";
import { buildLoanAgreementHref } from "@/lib/paymentUrls";
import { cn } from "@/lib/utils";

/** Terms hold for 24 hours; the demo starts a few seconds in so the clock reads live. */
const VALIDITY_SECONDS = 24 * 60 * 60 - 12;

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(amount)));
}

function hms(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

/**
 * Loan confirmation — the bank returns an APPROVED amount (a ceiling), valid for
 * 24 hours. The customer's real question is "what do I pay now?", so the down
 * payment is the dominant figure; the loan is the lever that moves it. Proceed
 * with the approved amount, or borrow less (never more) and watch the down
 * payment rise. On commit the split locks and feeds the agreement + disbursement.
 */
export function LoanSanctionedScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bankId = searchParams.get("bank");
  const bank = useMemo(() => bankForQueryParam(bankId), [bankId]);

  const approvedLoan = BANK_DISBURSEMENT_INR;
  const [loan, setLoan] = useState(approvedLoan);
  const [remaining, setRemaining] = useState(VALIDITY_SECONDS);
  const [ackoOnly, setAckoOnly] = useState(false);

  useEffect(() => {
    setAckoOnly(isAckoOnly(readDealerVisibility()));
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => window.clearInterval(id);
  }, []);

  const expired = remaining === 0;
  const downPayment = cashDownPaymentDueInr(loan);
  const recipient = ackoOnly ? "AckoDrive" : "the dealer";

  const commit = useCallback(() => {
    router.push(buildLoanAgreementHref(bankId, String(loan), downPayment));
  }, [router, bankId, loan, downPayment]);

  const reconfirm = useCallback(() => {
    setRemaining(VALIDITY_SECONDS);
    setLoan(approvedLoan);
  }, [approvedLoan]);

  const replies = useMemo(
    () =>
      expired
        ? [{ label: "Re-confirm with the bank", onClick: reconfirm, echo: null }]
        : [
            {
              label: `Confirm — pay ${formatInr(downPayment)} down`,
              onClick: commit,
              echo: "Let's go with these terms" as string | null,
            },
          ],
    [expired, downPayment, commit, reconfirm],
  );

  return (
    <ConciergeTurnShell
      says={[
        "Your loan is approved, Sharath!",
        `${bank.name} approved up to ${formatInr(approvedLoan)}. Your part is the down payment below; the loan covers the rest, paid straight to ${recipient}. These terms hold for 24 hours.`,
      ]}
      artifact={
        <div className="flex flex-col gap-4">
          <LoanConfirmationCard
            onRoad={ON_ROAD_PRICE_INR}
            approvedLoan={approvedLoan}
            loan={loan}
            downPayment={downPayment}
            remaining={remaining}
            expired={expired}
            onLoanChange={setLoan}
          />
          <FinanceStatusTimeline current="confirmation" />
        </div>
      }
      footnote="Valid for 24 hours. Borrow less to lower your loan if you like — you can't go above what the bank approved. Your down payment rises as the loan drops."
      replies={replies}
      callLabel="Questions on the split? I can call you"
      manageShowVehicleIdentification
    />
  );
}

/* ------------------------------------------------------------------ */

function LoanConfirmationCard({
  onRoad,
  approvedLoan,
  loan,
  downPayment,
  remaining,
  expired,
  onLoanChange,
}: {
  onRoad: number;
  approvedLoan: number;
  loan: number;
  downPayment: number;
  remaining: number;
  expired: boolean;
  onLoanChange: (value: number) => void;
}) {
  const [adjustOpen, setAdjustOpen] = useState(false);
  const lowered = loan < approvedLoan;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl bg-white card-elevated tabular-nums",
        expired && "opacity-70",
      )}
    >
      {/* Validity bar */}
      <div
        className={cn(
          "flex items-center justify-between gap-2 px-4 py-2.5 text-xs font-medium",
          expired ? "bg-[#fdecea] text-[#c2160c]" : "bg-[#fff7e5] text-[#b46a00]",
        )}
      >
        <span>{expired ? "These approved terms have expired" : "Approved terms — valid for"}</span>
        {!expired ? (
          <span className="font-semibold tracking-[0.04em]">{hms(remaining)}</span>
        ) : null}
      </div>

      {/* Reference rows */}
      <div className="flex flex-col px-4 pt-3">
        <Row label="Vehicle price" value={formatInr(onRoad)} muted />
        <Row
          label="Bank approves"
          value={formatInr(loan)}
          tag={lowered ? "Lowered" : "Max approved"}
        />
      </div>

      {/* Down payment — the dominant "pay now" figure */}
      <div className="mx-4 mt-3 rounded-xl bg-[#f6f3ff] px-4 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-[#5920c5]">
          Your down payment — due now
        </p>
        <p className="mt-1 text-[30px] font-semibold leading-none tracking-tight text-[#121212]">
          {formatInr(downPayment)}
        </p>
        <p className="mt-1.5 text-xs leading-[18px] text-[#4b4b4b]">
          You pay this; the {formatInr(loan)} loan covers the rest.
        </p>
      </div>

      {/* Borrow-less control — secondary, never the easy default */}
      <div className="px-4 pb-4 pt-3">
        {!adjustOpen ? (
          <button
            type="button"
            onClick={() => setAdjustOpen(true)}
            disabled={expired}
            className="text-sm font-medium text-[#5920c5] underline-offset-2 transition-opacity hover:underline disabled:opacity-40"
          >
            Want to borrow less?
          </button>
        ) : (
          <div className="rounded-xl border border-[#ece6fb] bg-[#fbfaff] p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#121212]">Loan amount</span>
              <span className="font-semibold text-[#121212]">{formatInr(loan)}</span>
            </div>
            <input
              type="range"
              min={MIN_LOAN_INR}
              max={approvedLoan}
              step={SLIDER_STEP}
              value={loan}
              disabled={expired}
              onChange={(e) => onLoanChange(Number(e.target.value))}
              aria-label="Loan amount"
              className="mt-2 w-full accent-[#6841e6] disabled:opacity-40"
            />
            <div className="mt-1 flex justify-between text-[11px] text-[#8f8e92]">
              <span>{formatInr(MIN_LOAN_INR)}</span>
              <span>Approved {formatInr(approvedLoan)}</span>
            </div>
            <p className="mt-2 text-[11px] leading-[15px] text-[#757575]">
              Lower the loan and your down payment goes up — never the other way. You can&apos;t
              borrow more than the bank approved.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  tag,
  muted,
}: {
  label: string;
  value: string;
  tag?: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-dashed border-[#efefef] py-2.5 last:border-0">
      <span className="flex items-center gap-2 text-sm leading-5 text-[#4b4b4b]">
        {label}
        {tag ? (
          <span className="rounded-full bg-[#f0edfb] px-2 py-0.5 text-[10.5px] font-medium leading-4 text-[#5920c5]">
            {tag}
          </span>
        ) : null}
      </span>
      <span
        className={cn(
          "text-sm font-medium leading-5",
          muted ? "text-[#757575]" : "text-[#121212]",
        )}
      >
        {value}
      </span>
    </div>
  );
}
