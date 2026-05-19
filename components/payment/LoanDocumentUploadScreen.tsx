"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

import { KycTopNavHeader } from "@/components/kyc/KycTopNavHeader";
import { LoanSubmitConfirmBottomSheet } from "@/components/payment/LoanSubmitConfirmBottomSheet";

function RemoveChip({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="absolute right-2 top-2 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#36354c]/85 text-white shadow-sm backdrop-blur-[2px] transition-colors hover:bg-[#36354c] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/30 active:scale-95"
      aria-label={`Remove ${label}`}
    >
      <span className="text-lg leading-none" aria-hidden>
        ×
      </span>
    </button>
  );
}

function AadhaarPreview() {
  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-[#e0dcd4] bg-gradient-to-b from-[#fff9f0] to-[#fffef8]">
      <RemoveChip label="Aadhaar upload" />
      <div className="flex gap-3 p-3 pr-12">
        <div
          className="h-[72px] w-[56px] shrink-0 rounded bg-[#e8e8e8] bg-gradient-to-br from-[#ddd] to-[#bbb]"
          aria-hidden
        />
        <div className="min-w-0 flex-1 text-[11px] leading-snug text-[#121212]">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-[#5c5c5c]">
            Government of India
          </p>
          <p className="mt-1.5 text-sm font-semibold leading-tight">Samarth Sharma</p>
          <p className="mt-0.5 text-[10px] text-[#5c5c5c]">Male · 20-06-1986</p>
          <p className="mt-2 font-mono text-xs font-medium tracking-wide tabular-nums">1234 5678 9012</p>
        </div>
      </div>
      <div className="h-1.5 bg-gradient-to-r from-[#ff9933] via-[#fff] to-[#138808]" aria-hidden />
    </div>
  );
}

function PanPreview() {
  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-[#c4a574] bg-[#fff8e7]">
      <RemoveChip label="PAN upload" />
      <div className="flex gap-3 p-3 pr-12">
        <div className="min-w-0 flex-1 text-[10px] leading-snug text-[#121212]">
          <p className="text-[9px] font-semibold">आयकर विभाग · INCOME TAX DEPARTMENT</p>
          <p className="mt-0.5 text-[8px] text-[#5c5c5c]">भारत सरकार · GOVT. OF INDIA</p>
          <div className="mt-2 flex gap-2">
            <div
              className="h-14 w-11 shrink-0 rounded bg-[#e8e8e8] bg-gradient-to-br from-[#ddd] to-[#bbb]"
              aria-hidden
            />
            <div>
              <p className="text-[11px] font-semibold">APPLICANT NAME</p>
              <p className="mt-1 font-mono text-xs font-semibold tracking-wide">ABCDE1234F</p>
            </div>
          </div>
        </div>
        <div
          className="grid h-16 w-16 shrink-0 grid-cols-6 grid-rows-6 gap-px border border-[#c4a574]/60 bg-white p-1"
          aria-hidden
        >
          {Array.from({ length: 36 }).map((_, i) => (
            <span key={i} className={i % 3 === 0 ? "bg-[#121212]" : "bg-[#e8e8e8]"} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Loan application — document upload (duplicated from KYC upload; static dummy; Submit → confirm sheet → loan processing).
 */
export function LoanDocumentUploadScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitSheetOpen, setSubmitSheetOpen] = useState(false);

  const navigateToLoanProcessing = useCallback(() => {
    const bank = searchParams.get("bank");
    const href =
      bank != null && bank.length > 0
        ? `/payment/loan-processing?bank=${encodeURIComponent(bank)}`
        : "/payment/loan-processing";
    router.push(href);
  }, [router, searchParams]);

  const onConfirmFromSheet = useCallback(() => {
    setSubmitSheetOpen(false);
    navigateToLoanProcessing();
  }, [navigateToLoanProcessing]);

  return (
    <div className="min-h-dvh bg-[#FFFFFF] font-sans">
      <KycTopNavHeader />

      <main className="mx-auto w-full max-w-[640px] px-5 pb-32 pt-2">
        <h1 className="text-2xl font-semibold leading-8 tracking-[-0.1px] text-[#121212]">
          Upload documents to process your loan
        </h1>

        <div className="mt-6 flex flex-col gap-6">
          <section className="rounded-xl border border-[#e8e8e8] bg-white p-4 shadow-[0_2px_8px_-2px_rgba(54,53,76,0.06)]">
            <p className="mb-3 text-sm font-medium leading-5 text-[#121212]">Aadhaar card</p>
            <AadhaarPreview />
          </section>

          <section className="rounded-xl border border-[#e8e8e8] bg-white p-4 shadow-[0_2px_8px_-2px_rgba(54,53,76,0.06)]">
            <p className="mb-3 text-sm font-medium leading-5 text-[#121212]">PAN card</p>
            <PanPreview />
          </section>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-transparent bg-[#FFFFFF] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_8px_-2px_rgba(54,53,76,0.06)]">
        <div className="mx-auto w-full max-w-[640px]">
          <button
            type="button"
            className="primary-cta focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/30 focus-visible:ring-offset-2"
            onClick={() => setSubmitSheetOpen(true)}
          >
            Submit
          </button>
        </div>
      </div>

      <LoanSubmitConfirmBottomSheet
        open={submitSheetOpen}
        onClose={() => setSubmitSheetOpen(false)}
        onConfirm={onConfirmFromSheet}
      />
    </div>
  );
}
