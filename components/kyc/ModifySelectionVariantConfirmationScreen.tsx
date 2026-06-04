"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { BookingCarSummaryCard } from "@/components/kyc/BookingCarSummaryCard";
import { KycTopNavHeader } from "@/components/kyc/KycTopNavHeader";
import { BOOKING_CONFIRMED_ASSETS } from "@/components/kyc/kyc-booking-confirmed-assets";
import {
  BOOKING_EXPRESS_DELIVERY_TEXT_CLASS,
  BOOKING_STANDARD_DELIVERY_TEXT_CLASS,
  getBookingDeliveryIconSrc,
} from "@/lib/experience-flow-content";
import { JOURNEY_PATHS } from "@/lib/journey-routes";
import { getModifySelectionCarCutoutForColour } from "@/lib/modify-selection-car-cutouts";
import {
  clearModifySelectionVariantPending,
  readModifySelectionVariantPending,
} from "@/lib/modify-selection-variant-pending";
import {
  findModifySelectionColourOption,
  resolveModifySelectionColourQuote,
} from "@/lib/modify-selection-colours-content";
import {
  findModifySelectionVariantOption,
  MODIFY_SELECTION_VARIANT_CONFIRM_CTA,
  MODIFY_SELECTION_VARIANT_CONFIRM_SUBLINE,
  MODIFY_SELECTION_VARIANT_CONFIRM_TITLE,
} from "@/lib/modify-selection-variants-content";
import { MODIFY_SELECTION_STAGGER_MS } from "@/lib/modify-selection-stagger";

/** Stagger: nav + footer CTA immediate; then title → subline → hero card. */
const { title: STAGGER_TITLE_MS, subtext: STAGGER_SUBTEXT_MS, heading: STAGGER_HERO_MS } =
  MODIFY_SELECTION_STAGGER_MS;

/**
 * Variant change confirmation — review variant + delivery before applying the change.
 */
export function ModifySelectionVariantConfirmationScreen() {
  const router = useRouter();
  const [pending, setPending] = useState(() => readModifySelectionVariantPending());

  useEffect(() => {
    setPending(readModifySelectionVariantPending());
  }, []);

  const selection = useMemo(() => {
    if (pending == null) return null;
    const variant = findModifySelectionVariantOption(pending.variantId);
    const colour = findModifySelectionColourOption(pending.colourId);
    if (variant == null || colour == null) return null;
    const quote = resolveModifySelectionColourQuote(colour, pending.deliveryChoice);
    return {
      variantName: variant.name,
      colourName: colour.name,
      deliveryLine: quote.deliveryLine,
      isExpressDelivery: quote.isExpressDelivery,
    };
  }, [pending]);

  useEffect(() => {
    if (pending == null || selection == null) {
      router.replace("/kyc/modify-selection/variant/colour");
    }
  }, [pending, router, selection]);

  const onConfirmChange = useCallback(() => {
    clearModifySelectionVariantPending();
    router.push(JOURNEY_PATHS.kyc.hub);
  }, [router]);

  if (pending == null || selection == null) {
    return null;
  }

  return (
    <div className="min-h-dvh bg-white font-sans">
      <KycTopNavHeader />

      <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col px-5 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-2">
        <h1
          className="payment-success-stagger text-2xl font-semibold leading-8 tracking-tight text-[#121212]"
          style={{ animationDelay: `${STAGGER_TITLE_MS}ms` }}
        >
          {MODIFY_SELECTION_VARIANT_CONFIRM_TITLE}
        </h1>

        <p
          className="payment-success-stagger mt-2 text-sm font-normal leading-[22px] text-[#4b4b4b]"
          style={{ animationDelay: `${STAGGER_SUBTEXT_MS}ms` }}
        >
          {MODIFY_SELECTION_VARIANT_CONFIRM_SUBLINE}
        </p>

        <div
          className="payment-success-stagger mt-5"
          style={{ animationDelay: `${STAGGER_HERO_MS}ms` }}
        >
          <BookingCarSummaryCard
            variant="hero"
            carCutoutSrc={getModifySelectionCarCutoutForColour(pending.colourId)}
            cardDetails={{
              carVariant: selection.variantName,
              carColor: selection.colourName,
              deliveryLine: selection.deliveryLine,
              deliveryTextClass: selection.isExpressDelivery
                ? BOOKING_EXPRESS_DELIVERY_TEXT_CLASS
                : BOOKING_STANDARD_DELIVERY_TEXT_CLASS,
              deliveryIconSrc: selection.isExpressDelivery
                ? BOOKING_CONFIRMED_ASSETS.expressDelivery
                : getBookingDeliveryIconSrc("standard"),
            }}
          />
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-10 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_6px_0_rgba(54,53,76,0.08)]">
        <div className="mx-auto w-full max-w-[640px] bg-white px-5 py-4">
          <button type="button" onClick={onConfirmChange} className="primary-cta w-full">
            {MODIFY_SELECTION_VARIANT_CONFIRM_CTA}
          </button>
        </div>
      </div>
    </div>
  );
}
