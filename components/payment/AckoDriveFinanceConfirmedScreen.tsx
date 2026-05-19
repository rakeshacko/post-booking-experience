"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Lottie from "lottie-react";

import ackoDriveFinanceSuccessLottie from "@/components/kyc/lottie/acko-drive-finance-success.json";
import { BankSelectionBottomSheet } from "@/components/payment/BankSelectionBottomSheet";
import { FinanceWhatsNextPaymentProcess } from "@/components/payment/FinanceWhatsNextPaymentProcess";
import { BANK_SHEET_OPTIONS } from "@/components/payment/payment-choose-assets";
import { SUCCESS_SCREEN_HEADLINE_SUBTEXT_GAP_CLASS } from "@/components/ui/success-screen-layout";

/** Reveal headline + banking row while Lottie is still playing (do not wait for full animation). */
const HEADER_SHOW_MS = 450;
/** Reveal documents block shortly after header. */
const DOCUMENTS_AFTER_HEADER_MS = 280;

function bankForQueryParam(bankId: string | null) {
  if (!bankId) return BANK_SHEET_OPTIONS[0];
  const found = BANK_SHEET_OPTIONS.find((b) => b.id === bankId);
  return found ?? BANK_SHEET_OPTIONS[0];
}

/**
 * ACKO Drive finance confirmed — full layout per Figma “Finance with AD / Payment option confirmation”.
 */
export function AckoDriveFinanceConfirmedScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bankId = searchParams.get("bank");
  const bank = useMemo(() => bankForQueryParam(bankId), [bankId]);

  const [showHeader, setShowHeader] = useState(false);
  const [showBody, setShowBody] = useState(false);
  const [bankSheetOpen, setBankSheetOpen] = useState(false);

  const onBankSheetConfirm = useCallback(
    (nextBankId: string) => {
      setBankSheetOpen(false);
      router.push(`/payment/acko-drive-finance-confirmed?bank=${encodeURIComponent(nextBankId)}`);
    },
    [router],
  );

  useEffect(() => {
    const id = window.setTimeout(() => setShowHeader(true), HEADER_SHOW_MS);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!showHeader) return;
    const id = window.setTimeout(() => setShowBody(true), DOCUMENTS_AFTER_HEADER_MS);
    return () => window.clearTimeout(id);
  }, [showHeader]);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#fafbfb] font-sans shadow-[0_-4px_8px_-2px_rgba(54,53,76,0.06)]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[50%] bg-gradient-to-b from-[#e8f8ef]/90 via-[#f4fbf7]/40 to-transparent transition-opacity duration-700"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-dvh flex-col justify-start pt-[64px] transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]">
        <main className="mx-auto flex min-h-0 w-full flex-1 flex-col overflow-y-auto px-4 pb-[calc(112px+32px+env(safe-area-inset-bottom))] transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]">
          <div className="flex w-full flex-col items-center">
            <div className="relative flex h-[96px] w-[96px] shrink-0 items-center justify-center">
              <Lottie
                animationData={ackoDriveFinanceSuccessLottie}
                loop={false}
                className="h-full w-full"
                aria-label="Success animation"
              />
            </div>

            {showHeader && (
              <div
                className={`payment-success-stagger mt-5 flex w-full flex-col items-center ${SUCCESS_SCREEN_HEADLINE_SUBTEXT_GAP_CLASS}`}
              >
                <h1 className="text-center text-2xl font-semibold leading-8 tracking-[-0.1px] text-[#121212]">
                  <span className="block">You&apos;re financing with</span>
                  <span className="block">ACKO Drive</span>
                </h1>
                <div className="flex w-full flex-wrap items-center justify-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="whitespace-nowrap text-xs font-normal leading-5 text-[#4b4b4b]">
                      Your banking partner
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="relative h-5 w-5 shrink-0 overflow-hidden rounded-sm bg-white">
                        <Image
                          src={bank.logoSrc}
                          alt={bank.name}
                          width={20}
                          height={20}
                          className="object-contain"
                          unoptimized
                          sizes="20px"
                        />
                      </span>
                      <span className="whitespace-nowrap text-sm font-medium leading-5 text-[#121212]">
                        {bank.brandText}
                      </span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBankSheetOpen(true)}
                    className="cursor-pointer border-0 bg-transparent p-0 font-inherit whitespace-nowrap text-xs font-medium leading-5 text-[#1b73e8] underline-offset-2 transition-opacity hover:underline focus-visible:outline focus-visible:underline"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}
          </div>

          {showBody && (
            <div className="payment-success-stagger mt-10 w-full" style={{ animationDelay: "0ms" }}>
              <FinanceWhatsNextPaymentProcess />
            </div>
          )}
        </main>
      </div>

      {showBody && (
        <div
          className="payment-success-stagger fixed inset-x-0 bottom-0 z-20 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_6px_0_rgba(54,53,76,0.08)]"
          style={{ animationDelay: "120ms" }}
        >
          <div className="mx-auto flex h-[112px] w-full max-w-[640px] flex-col">
            <div className="flex h-8 w-full shrink-0 items-center justify-center bg-[#fff7e5] px-5">
              <p className="text-center text-xs leading-[18px] text-[#121212]">
                <span className="font-medium">Up next:</span>
                <span>{` Document upload for loan application`}</span>
              </p>
            </div>
            <div className="flex min-h-20 flex-1 items-start justify-center bg-white px-5 pt-3">
              <button
                type="button"
                className="primary-cta w-full rounded-lg focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/30 focus-visible:ring-offset-2"
                onClick={() =>
                  router.push(
                    `/payment/loan-documents-upload?bank=${encodeURIComponent(bank.id)}`,
                  )
                }
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <BankSelectionBottomSheet
        open={bankSheetOpen}
        onClose={() => setBankSheetOpen(false)}
        onConfirm={onBankSheetConfirm}
        initialBankId={bank.id}
      />
    </div>
  );
}
