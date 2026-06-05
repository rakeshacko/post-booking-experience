"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { CancelBookingCarCard } from "@/components/kyc/CancelBookingCarCard";
import { CancelBookingReasonBottomSheet } from "@/components/kyc/CancelBookingReasonBottomSheet";
import { CancelBookingRefundSummaryCard } from "@/components/kyc/CancelBookingRefundSummaryCard";
import { KycTopNavHeader } from "@/components/kyc/KycTopNavHeader";
import {
  CANCEL_BOOKING_CONFIRM_CTA,
  CANCEL_BOOKING_CONFIRM_OVERLINE,
  CANCEL_BOOKING_MODIFY_CTA,
  CANCEL_BOOKING_MODIFY_PROMPT,
  CANCEL_BOOKING_STILL_CANCEL_PROMPT,
  CANCEL_BOOKING_SUCCESS_HREF,
  resolveCancelBookingCarDetails,
  resolveCancelBookingHeadline,
  type CancelBookingCarDetails,
  type CancelBookingReasonId,
} from "@/lib/cancel-booking-content";
import { CANCEL_BOOKING_STAGGER_MS } from "@/lib/cancel-booking-stagger";

const {
  overline: STAGGER_OVERLINE_MS,
  headline: STAGGER_HEADLINE_MS,
  carCard: STAGGER_CAR_CARD_MS,
  modifyPrompt: STAGGER_MODIFY_PROMPT_MS,
  modifyCta: STAGGER_MODIFY_CTA_MS,
  stillCancelPrompt: STAGGER_STILL_CANCEL_MS,
  refundCard: STAGGER_REFUND_CARD_MS,
  confirmCta: STAGGER_CONFIRM_CTA_MS,
} = CANCEL_BOOKING_STAGGER_MS;

/**
 * Full-page cancel confirmation — Figma Post-booking-experience / node 2709:17395.
 */
export function CancelBookingConfirmScreen() {
  const router = useRouter();
  const [headline, setHeadline] = useState("You have come a long way to get your Creta");
  const [carDetails, setCarDetails] = useState<CancelBookingCarDetails>(
    resolveCancelBookingCarDetails,
  );
  const [reasonSheetOpen, setReasonSheetOpen] = useState(false);

  useEffect(() => {
    setHeadline(resolveCancelBookingHeadline());
    setCarDetails(resolveCancelBookingCarDetails());
  }, []);

  const onGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const onOpenReasonSheet = useCallback(() => {
    setReasonSheetOpen(true);
  }, []);

  const onReasonSheetConfirm = useCallback(
    (_reasonId: CancelBookingReasonId) => {
      setReasonSheetOpen(false);
      router.push(CANCEL_BOOKING_SUCCESS_HREF);
    },
    [router],
  );

  return (
    <div className="relative min-h-dvh bg-white font-sans">
      <div className="relative z-10 mx-auto flex w-full max-w-[640px] flex-1 flex-col">
        <KycTopNavHeader onBack={onGoBack} transparent />

        <main className="flex min-h-0 flex-1 flex-col pb-[max(2rem,env(safe-area-inset-bottom))]">
          <section className="bg-gradient-to-b from-white to-[#f5f5f5] px-5 pt-2 pb-5">
            <p
              className="payment-success-stagger text-base font-medium leading-6 text-[#D16900]"
              style={{ animationDelay: `${STAGGER_OVERLINE_MS}ms` }}
            >
              {CANCEL_BOOKING_CONFIRM_OVERLINE}
            </p>

            <h1
              className="payment-success-stagger mt-2 text-2xl font-semibold leading-8 tracking-[-0.1px] text-[#121212]"
              style={{ animationDelay: `${STAGGER_HEADLINE_MS}ms` }}
            >
              {headline}
            </h1>

            <div
              className="payment-success-stagger mt-6"
              style={{ animationDelay: `${STAGGER_CAR_CARD_MS}ms` }}
            >
              <CancelBookingCarCard details={carDetails} />
            </div>
          </section>

          <section className="px-5 pt-8">
            <p
              className="payment-success-stagger text-base font-medium leading-6 text-[#121212]"
              style={{ animationDelay: `${STAGGER_MODIFY_PROMPT_MS}ms` }}
            >
              {CANCEL_BOOKING_MODIFY_PROMPT}
            </p>

            <button
              type="button"
              className="payment-success-stagger demo-nav-cta mt-4 w-full"
              style={{ animationDelay: `${STAGGER_MODIFY_CTA_MS}ms` }}
            >
              {CANCEL_BOOKING_MODIFY_CTA}
            </button>

            <p
              className="payment-success-stagger mt-8 text-base font-medium leading-6 text-[#121212]"
              style={{ animationDelay: `${STAGGER_STILL_CANCEL_MS}ms` }}
            >
              {CANCEL_BOOKING_STILL_CANCEL_PROMPT}
            </p>

            <div
              className="payment-success-stagger mt-4"
              style={{ animationDelay: `${STAGGER_REFUND_CARD_MS}ms` }}
            >
              <CancelBookingRefundSummaryCard />
            </div>

            <button
              type="button"
              onClick={onOpenReasonSheet}
              className="payment-success-stagger demo-nav-cta mt-4 w-full"
              style={{ animationDelay: `${STAGGER_CONFIRM_CTA_MS}ms` }}
            >
              {CANCEL_BOOKING_CONFIRM_CTA}
            </button>
          </section>
        </main>
      </div>

      <CancelBookingReasonBottomSheet
        open={reasonSheetOpen}
        onClose={() => setReasonSheetOpen(false)}
        onConfirm={onReasonSheetConfirm}
      />
    </div>
  );
}
