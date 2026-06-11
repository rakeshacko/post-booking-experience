"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Lottie from "lottie-react";

import {
  BOOKING_PAYMENT_SUCCESS_HERO,
  BOOKING_SUCCESS_LOTTIE_TICK_DATA,
} from "@/components/payment/booking-success-shared";
import { SUCCESS_SCREEN_HEADLINE_SUBTEXT_GAP_CLASS } from "@/components/ui/success-screen-layout";
import { useLoanApplicationBank } from "@/components/payment/loan-application/use-loan-application-bank";
import { loanProcessingPath } from "@/lib/loan-application-urls";

/** Auto-advance from loan submit success to loan processing. */
export const LOAN_APPLICATION_SUBMITTED_AUTO_REDIRECT_MS = 3000;

/**
 * Your application is on its way acknowledgment — no CTA; auto-navigates after 3 seconds.
 */
export function LoanApplicationSubmittedSuccessScreen() {
  const router = useRouter();
  const { bankId, bank } = useLoanApplicationBank();

  useEffect(() => {
    const redirect = window.setTimeout(() => {
      router.push(loanProcessingPath(bankId));
    }, LOAN_APPLICATION_SUBMITTED_AUTO_REDIRECT_MS);
    return () => window.clearTimeout(redirect);
  }, [bankId, router]);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#f1f0f5] font-sans">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[240px] w-full max-w-[640px] -translate-x-1/2"
        aria-hidden
      >
        <Image
          src={BOOKING_PAYMENT_SUCCESS_HERO}
          alt=""
          fill
          className="object-cover object-top"
          priority
          sizes="(max-width: 640px) 100vw, 640px"
          unoptimized
        />
      </div>
      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 pb-8 pt-8">
        <div className="-translate-y-8 flex w-full flex-col items-center text-center">
          <div className="relative flex h-[144px] w-[144px] shrink-0 items-center justify-center">
            {BOOKING_SUCCESS_LOTTIE_TICK_DATA ? (
              <Lottie
                animationData={BOOKING_SUCCESS_LOTTIE_TICK_DATA}
                loop={false}
                className="h-full w-full"
                aria-label="Loan application submitted animation"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center rounded-full bg-[#22c55e] text-4xl text-white shadow-[0_0_48px_rgba(34,197,94,0.45)]"
                aria-hidden
              >
                ✓
              </div>
            )}
          </div>
          <div
            className={`mt-2 flex w-full flex-col items-center ${SUCCESS_SCREEN_HEADLINE_SUBTEXT_GAP_CLASS}`}
          >
            <h1 className="text-[24px] font-semibold leading-7 tracking-tight text-[#1a1a1a]">
              Loan application submitted
            </h1>
            <p className="max-w-sm text-sm font-normal leading-5 text-[#6b7280]">
              I&apos;ve sent it to {bank.name} — I&apos;ll chase the review and keep you posted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
