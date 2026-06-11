"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import infoIcon from "@/assets/Info.svg";
import { GetHelpPillButton } from "@/components/kyc/GetHelpPillButton";
import { KycTopNavHeader } from "@/components/kyc/KycTopNavHeader";
import {
  MODIFY_SELECTION_BOOKING_AMOUNT_SECTION_ID,
  ModifySelectionReviewBookingAmountCard,
} from "@/components/kyc/ModifySelectionReviewBookingAmountCard";
import { ModifySelectionDeliveryOptionBottomSheet } from "@/components/kyc/ModifySelectionDeliveryOptionBottomSheet";
import { ModifySelectionReviewPaymentSummary } from "@/components/kyc/ModifySelectionReviewPaymentSummary";
import { ModifySelectionReviewSelectionCard } from "@/components/kyc/ModifySelectionReviewSelectionCard";
import { writeModifySelectionPendingFromSummary } from "@/lib/active-booking-snapshot";
import {
  buildBookingLockCheckoutHref,
  MODIFY_SELECTION_RETURN_SOURCE,
} from "@/lib/paymentUrls";
import {
  clearModifySelectionColourPending,
  readModifySelectionColourPending,
  writeModifySelectionColourPending,
} from "@/lib/modify-selection-colour-pending";
import {
  findModifySelectionColourOption,
  MODIFY_SELECTION_COLOUR_CONFIRM_PAY_CTA,
  MODIFY_SELECTION_COLOUR_CONFIRM_TITLE,
  resolveModifySelectionColourQuote,
  type ModifySelectionDeliveryChoice,
} from "@/lib/modify-selection-colours-content";
import {
  buildModifySelectionColourReviewPaySummary,
  formatModifySelectionInr,
} from "@/lib/modify-selection-review-pay-content";
import { MODIFY_SELECTION_STAGGER_MS } from "@/lib/modify-selection-stagger";

/** Stagger: nav + footer CTA immediate; then title → selection → booking → price summary. */
const { title: STAGGER_TITLE_MS, section: STAGGER_SELECTION_MS, bookingAmount: STAGGER_BOOKING_MS, priceSummary: STAGGER_PRICE_MS } =
  MODIFY_SELECTION_STAGGER_MS;

/**
 * Review selection and pay — Figma 2699:9339.
 */
export function ModifySelectionColourConfirmationScreen() {
  const router = useRouter();
  const bookingAmountSectionRef = useRef<HTMLElement>(null);
  const [pending, setPending] = useState(() => readModifySelectionColourPending());
  const [deliverySheetOpen, setDeliverySheetOpen] = useState(false);

  useEffect(() => {
    setPending(readModifySelectionColourPending());
  }, []);

  const option = useMemo(() => {
    if (pending == null) return null;
    return findModifySelectionColourOption(pending.colourId) ?? null;
  }, [pending]);

  const deliveryChoice = pending?.deliveryChoice ?? "express";

  const summary = useMemo(() => {
    if (option == null || pending == null) return null;
    return buildModifySelectionColourReviewPaySummary(option, deliveryChoice);
  }, [option, pending, deliveryChoice]);

  useEffect(() => {
    if (pending == null || option == null) {
      router.replace("/kyc/modify-selection/colour");
    }
  }, [pending, router, option]);

  const persistDeliveryChoice = useCallback(
    (choice: ModifySelectionDeliveryChoice) => {
      if (pending == null) return;
      const next = { ...pending, deliveryChoice: choice };
      writeModifySelectionColourPending(next);
      setPending(next);
      setDeliverySheetOpen(false);
    },
    [pending],
  );

  const scrollToBookingAmount = useCallback(() => {
    const target =
      bookingAmountSectionRef.current ??
      document.getElementById(MODIFY_SELECTION_BOOKING_AMOUNT_SECTION_ID);
    if (target == null) return;

    /** Sticky `KycTopNavHeader` — h-14 */
    const headerOffsetPx = 56;
    const top =
      target.getBoundingClientRect().top + window.scrollY - headerOffsetPx;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, []);

  const onEditColour = useCallback(() => {
    router.push("/kyc/modify-selection/colour");
  }, [router]);

  const onEditDelivery = useCallback(() => {
    if (option?.isExpressDelivery) {
      setDeliverySheetOpen(true);
    }
  }, [option?.isExpressDelivery]);

  const onPay = useCallback(() => {
    if (summary == null || pending == null || option == null) return;
    writeModifySelectionPendingFromSummary(summary, {
      colourId: pending.colourId,
      colourName: option.name,
      deliveryChoice: pending.deliveryChoice,
    });
    clearModifySelectionColourPending();
    router.push(
      buildBookingLockCheckoutHref(summary.bookingAmountToPayInr, {
        returnSource: MODIFY_SELECTION_RETURN_SOURCE,
      }),
    );
  }, [router, summary, pending, option]);

  if (pending == null || option == null || summary == null) {
    return null;
  }

  const expressQuote = resolveModifySelectionColourQuote(option, "express");

  return (
    <div className="min-h-dvh bg-[#f1f0f5] font-sans">
      <KycTopNavHeader endSlot={<GetHelpPillButton />} />

      <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col px-5 pb-[calc(5rem+32px+env(safe-area-inset-bottom))] pt-2">
        <h1
          className="payment-success-stagger text-2xl font-semibold leading-8 tracking-[-0.1px] text-[#121212]"
          style={{ animationDelay: `${STAGGER_TITLE_MS}ms` }}
        >
          {MODIFY_SELECTION_COLOUR_CONFIRM_TITLE}
        </h1>

        <div
          className="payment-success-stagger mt-5"
          style={{ animationDelay: `${STAGGER_SELECTION_MS}ms` }}
        >
          <ModifySelectionReviewSelectionCard
            colourId={pending.colourId}
            colourName={option.name}
            deliveryLine={summary.deliveryLine}
            isExpressDelivery={summary.isExpressDelivery}
            onEditColour={onEditColour}
            onEditDelivery={onEditDelivery}
            showDeliveryEdit={option.isExpressDelivery}
          />
        </div>

        <div
          className="payment-success-stagger"
          style={{ animationDelay: `${STAGGER_BOOKING_MS}ms` }}
        >
          <ModifySelectionReviewBookingAmountCard
            summary={summary}
            sectionRef={bookingAmountSectionRef}
          />
        </div>

        <div
          className="payment-success-stagger"
          style={{ animationDelay: `${STAGGER_PRICE_MS}ms` }}
        >
          <ModifySelectionReviewPaymentSummary summary={summary} />
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-10 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_4px_0_rgba(54,53,76,0.06)]">
        <div className="mx-auto flex h-20 w-full max-w-[640px] items-center justify-between gap-3 px-5">
          <div className="min-w-0">
            <p className="text-xs leading-[18px] text-[#757575]">Booking amount</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="text-lg font-semibold leading-6 text-[#121212]">
                {formatModifySelectionInr(summary.bookingAmountToPayInr)}
              </span>
              <button
                type="button"
                onClick={scrollToBookingAmount}
                className="flex size-4 shrink-0 items-center justify-center rounded focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/20"
                aria-label="View booking amount breakdown"
              >
                <Image src={infoIcon} alt="" width={16} height={16} className="size-4" unoptimized />
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={onPay}
            className="primary-cta ml-auto h-12 !w-[160px] shrink-0 px-[10px]"
          >
            {MODIFY_SELECTION_COLOUR_CONFIRM_PAY_CTA}
          </button>
        </div>
      </div>

      {option.isExpressDelivery ? (
        <ModifySelectionDeliveryOptionBottomSheet
          open={deliverySheetOpen}
          onClose={() => setDeliverySheetOpen(false)}
          onConfirm={persistDeliveryChoice}
          initialDeliveryChoice={deliveryChoice}
          expressDeliveryPriceInr={expressQuote.ackoDrivePriceInr}
          expressDeliveryLine={option.deliveryLine}
        />
      ) : null}
    </div>
  );
}
