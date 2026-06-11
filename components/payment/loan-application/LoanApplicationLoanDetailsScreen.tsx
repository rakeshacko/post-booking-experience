"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { LoanApplicationBankSummaryCard } from "@/components/payment/loan-application/LoanApplicationBankSummaryCard";
import { LoanApplicationFixedCta } from "@/components/payment/loan-application/LoanApplicationFixedCta";
import {
  LOAN_APPLICATION_CONTROL_TEXT_CLASS,
  LOAN_APPLICATION_FIELD_GAP_CLASS,
  LOAN_APPLICATION_MAIN_CLASS,
  LOAN_APPLICATION_PAGE_TITLE_CLASS,
  LOAN_APPLICATION_SECTION_GAP_CLASS,
  LOAN_APPLICATION_SECTION_LABEL_CLASS,
  LOAN_APPLICATION_STAGGER_MS,
  LOAN_APPLICATION_TITLE_TO_CARD_GAP_CLASS,
  loanApplicationStaggerAfterCard,
} from "@/components/payment/loan-application/loan-application-layout";
import { LoanApplicationPageStagger } from "@/components/payment/loan-application/LoanApplicationPageStagger";
import { LoanApplicationSegmentChip } from "@/components/payment/loan-application/LoanApplicationSegmentChip";
import { LoanApplicationShell } from "@/components/payment/loan-application/LoanApplicationShell";
import { useLoanApplicationBank } from "@/components/payment/loan-application/use-loan-application-bank";
import { useLoanApplicationState } from "@/components/payment/loan-application/use-loan-application-state";
import {
  LOAN_APPLICATION_TENURE_OPTIONS,
  type LoanApplicationEmploymentType,
} from "@/lib/loan-application-content";
import { loanApplicationNextPath, loanApplicationPath } from "@/lib/loan-application-urls";
import {
  estimateMonthlyEmiInr,
  formatInrAmountDigits,
  formatInrCompact,
  parseAnnualRateFromLabel,
  parseInrAmountInput,
} from "@/lib/loan-emi";
import { createDefaultLoanApplicationState } from "@/lib/loan-application-state";

const MIN_LOAN_INR = 1_00_000;
const MAX_LOAN_INR = 50_00_000;

const EMPLOYMENT_OPTIONS: { id: LoanApplicationEmploymentType; label: string }[] = [
  { id: "salaried", label: "Salaried" },
  { id: "self_employed", label: "Self employed" },
];

export function LoanApplicationLoanDetailsScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { bankId, bank } = useLoanApplicationBank();
  const { state, hydrated, persist, update } = useLoanApplicationState();
  const freshHandledRef = useRef(false);

  const [employmentType, setEmploymentType] = useState<LoanApplicationEmploymentType | null>(null);
  const [loanAmountInr, setLoanAmountInr] = useState(0);
  const [loanAmountInput, setLoanAmountInput] = useState("");
  const [tenureMonths, setTenureMonths] = useState(0);

  useEffect(() => {
    if (!hydrated || freshHandledRef.current) return;

    const isFresh = searchParams.get("fresh") === "1";
    if (isFresh) {
      freshHandledRef.current = true;
      const next = createDefaultLoanApplicationState();
      persist(next);
      setEmploymentType(next.loanDetails.employmentType);
      setLoanAmountInr(next.loanDetails.loanAmountInr);
      setLoanAmountInput(formatInrAmountDigits(next.loanDetails.loanAmountInr));
      setTenureMonths(next.loanDetails.tenureMonths);
      router.replace(loanApplicationPath(bankId, "loan-details"));
      return;
    }

    setEmploymentType(state.loanDetails.employmentType);
    setLoanAmountInr(state.loanDetails.loanAmountInr);
    setLoanAmountInput(formatInrAmountDigits(state.loanDetails.loanAmountInr));
    setTenureMonths(state.loanDetails.tenureMonths);
  }, [bankId, hydrated, persist, router, searchParams, state.loanDetails]);

  const onLoanAmountChange = useCallback((raw: string) => {
    const parsed = parseInrAmountInput(raw);
    const clamped = Math.min(MAX_LOAN_INR, parsed);
    setLoanAmountInr(clamped);
    setLoanAmountInput(formatInrAmountDigits(clamped));
  }, []);

  const annualRate = useMemo(() => parseAnnualRateFromLabel(bank.rate), [bank.rate]);

  const estimatedEmi = useMemo(
    () => estimateMonthlyEmiInr(loanAmountInr, tenureMonths, annualRate),
    [annualRate, loanAmountInr, tenureMonths],
  );

  const isFilled =
    employmentType != null && loanAmountInr >= MIN_LOAN_INR && tenureMonths > 0;

  const onContinue = useCallback(() => {
    if (!isFilled || employmentType == null) return;
    const next = update({
      loanDetails: {
        loanAmountInr,
        tenureMonths,
        employmentType,
      },
    });
    persist(next);
    router.push(loanApplicationNextPath(bankId, "loan-details"));
  }, [bankId, employmentType, isFilled, loanAmountInr, persist, router, tenureMonths, update]);

  return (
    <LoanApplicationShell currentRoute="loan-details">
      <main className={LOAN_APPLICATION_MAIN_CLASS}>
        <LoanApplicationPageStagger delayMs={LOAN_APPLICATION_STAGGER_MS.title}>
          <h1 className={LOAN_APPLICATION_PAGE_TITLE_CLASS}>First, the loan itself — how much and how long?</h1>
        </LoanApplicationPageStagger>

        <LoanApplicationPageStagger
          delayMs={LOAN_APPLICATION_STAGGER_MS.card}
          className={LOAN_APPLICATION_TITLE_TO_CARD_GAP_CLASS}
        >
          <LoanApplicationBankSummaryCard bank={bank} />
        </LoanApplicationPageStagger>

        <LoanApplicationPageStagger delayMs={loanApplicationStaggerAfterCard(1)}>
          <p className={`${LOAN_APPLICATION_SECTION_GAP_CLASS} ${LOAN_APPLICATION_SECTION_LABEL_CLASS}`}>
            Select your employment type
          </p>
          <div className={`${LOAN_APPLICATION_FIELD_GAP_CLASS} grid grid-cols-2 gap-2`}>
            {EMPLOYMENT_OPTIONS.map((option) => (
              <LoanApplicationSegmentChip
                key={option.id}
                label={option.label}
                selected={employmentType === option.id}
                onClick={() => setEmploymentType(option.id)}
                size="employment"
              />
            ))}
          </div>
        </LoanApplicationPageStagger>

        <LoanApplicationPageStagger delayMs={loanApplicationStaggerAfterCard(2)}>
          <p className={`${LOAN_APPLICATION_SECTION_GAP_CLASS} ${LOAN_APPLICATION_SECTION_LABEL_CLASS}`}>
            Enter your loan amount
          </p>
          <div className={LOAN_APPLICATION_FIELD_GAP_CLASS}>
            <label htmlFor="loan-amount-input" className="sr-only">
              Loan amount in rupees
            </label>
            <div className="flex h-12 w-full items-center rounded-lg bg-white card-elevated px-4">
              <span
                className={`shrink-0 ${LOAN_APPLICATION_CONTROL_TEXT_CLASS} text-[#040222]`}
                aria-hidden
              >
                ₹{loanAmountInput.length > 0 ? " " : ""}
              </span>
              <input
                id="loan-amount-input"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={loanAmountInput}
                onChange={(e) => onLoanAmountChange(e.target.value)}
                className={`min-w-0 flex-1 border-0 bg-transparent p-0 ${LOAN_APPLICATION_CONTROL_TEXT_CLASS} text-[#040222] outline-none placeholder:text-[#9e9e9e] focus:ring-0 tabular-nums`}
                aria-describedby="loan-amount-hint"
              />
            </div>
          </div>
          <p id="loan-amount-hint" className="mt-2 text-xs font-normal leading-[18px] text-[#757575]">
            Bank will confirm the final amount
          </p>
        </LoanApplicationPageStagger>

        <LoanApplicationPageStagger delayMs={loanApplicationStaggerAfterCard(3)}>
          <p className={`${LOAN_APPLICATION_SECTION_GAP_CLASS} ${LOAN_APPLICATION_SECTION_LABEL_CLASS}`}>
            Loan tenure (in months)
          </p>
          <div
            className={`${LOAN_APPLICATION_FIELD_GAP_CLASS} grid grid-cols-6 gap-2`}
            role="group"
            aria-label="Loan tenure in months"
          >
            {LOAN_APPLICATION_TENURE_OPTIONS.map((months) => (
              <LoanApplicationSegmentChip
                key={months}
                label={String(months)}
                selected={tenureMonths === months}
                onClick={() => setTenureMonths(months)}
                size="tenure"
                className="min-w-0 px-0"
              />
            ))}
          </div>

          {isFilled && estimatedEmi > 0 ? (
            <p className="mt-4 text-xs font-normal leading-[18px] text-[#757575]">
              Estimated EMI:{" "}
              <span className="font-medium text-[#121212]">{formatInrCompact(estimatedEmi)}</span>
            </p>
          ) : null}
        </LoanApplicationPageStagger>
      </main>

      <LoanApplicationFixedCta
        label="Continue"
        onClick={onContinue}
        disabled={!isFilled}
        staggerDelayMs={loanApplicationStaggerAfterCard(4)}
      />
    </LoanApplicationShell>
  );
}
