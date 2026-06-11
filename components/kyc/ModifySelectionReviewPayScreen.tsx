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
  getModifySelectionCarBrandById,
  MODIFY_SELECTION_CAR_BRAND_PATH,
} from "@/lib/modify-selection-car-brands-content";
import { getModifySelectionCarModelById } from "@/lib/modify-selection-car-models-content";
import {
  clearModifySelectionColourPending,
  readModifySelectionColourPending,
  writeModifySelectionColourPending,
} from "@/lib/modify-selection-colour-pending";
import {
  findModifySelectionColourOption,
  resolveModifySelectionColourQuote,
  type ModifySelectionDeliveryChoice,
} from "@/lib/modify-selection-colours-content";
import {
  clearModifySelectionDifferentCarPending,
  readModifySelectionDifferentCarPending,
  writeModifySelectionDifferentCarPending,
} from "@/lib/modify-selection-different-car-pending";
import {
  modifySelectionDifferentCarColourPath,
  modifySelectionDifferentCarModelPath,
} from "@/lib/modify-selection-different-car-paths";
import {
  buildModifySelectionColourReviewPaySummary,
  formatModifySelectionInr,
  MODIFY_SELECTION_REVIEW_PAY_TITLE,
} from "@/lib/modify-selection-review-pay-content";
import { MODIFY_SELECTION_STAGGER_MS } from "@/lib/modify-selection-stagger";
import {
  clearModifySelectionVariantPending,
  readModifySelectionVariantPending,
  writeModifySelectionVariantPending,
} from "@/lib/modify-selection-variant-pending";
import { findModifySelectionVariantOption } from "@/lib/modify-selection-variants-content";
import {
  buildBookingLockCheckoutHref,
  MODIFY_SELECTION_RETURN_SOURCE,
} from "@/lib/paymentUrls";

const MODIFY_SELECTION_REVIEW_PAY_CTA = "Pay";

const { title: STAGGER_TITLE_MS, section: STAGGER_SELECTION_MS, bookingAmount: STAGGER_BOOKING_MS, priceSummary: STAGGER_PRICE_MS } =
  MODIFY_SELECTION_STAGGER_MS;

type ModifySelectionReviewPayFlow = "colour" | "variant" | "different-car";

type ModifySelectionReviewPayScreenProps = {
  flow: ModifySelectionReviewPayFlow;
  brandId?: string;
  modelId?: string;
};

/**
 * Review selection and pay — shared by colour, variant, and different-car modify flows.
 */
export function ModifySelectionReviewPayScreen({
  flow,
  brandId,
  modelId,
}: ModifySelectionReviewPayScreenProps) {
  const router = useRouter();
  const bookingAmountSectionRef = useRef<HTMLElement>(null);
  const [deliverySheetOpen, setDeliverySheetOpen] = useState(false);

  const [colourPending, setColourPending] = useState(() =>
    flow === "colour" ? readModifySelectionColourPending() : null,
  );
  const [variantPending, setVariantPending] = useState(() =>
    flow === "variant" ? readModifySelectionVariantPending() : null,
  );
  const [differentCarPending, setDifferentCarPending] = useState(() =>
    flow === "different-car" ? readModifySelectionDifferentCarPending() : null,
  );

  useEffect(() => {
    if (flow === "colour") setColourPending(readModifySelectionColourPending());
    if (flow === "variant") setVariantPending(readModifySelectionVariantPending());
    if (flow === "different-car") setDifferentCarPending(readModifySelectionDifferentCarPending());
  }, [flow]);

  const resolved = useMemo(() => {
    if (flow === "colour" && colourPending != null) {
      const option = findModifySelectionColourOption(colourPending.colourId);
      if (option == null) return null;
      return {
        colourId: colourPending.colourId,
        colourName: option.name,
        deliveryChoice: colourPending.deliveryChoice,
        option,
        summary: buildModifySelectionColourReviewPaySummary(option, colourPending.deliveryChoice),
        missingRedirect: "/kyc/modify-selection/colour",
        editColourPath: "/kyc/modify-selection/colour",
        carTitle: undefined as string | undefined,
        carVariant: undefined as string | undefined,
      };
    }

    if (flow === "variant" && variantPending != null) {
      const variant = findModifySelectionVariantOption(variantPending.variantId);
      const option = findModifySelectionColourOption(variantPending.colourId);
      if (variant == null || option == null) return null;
      return {
        colourId: variantPending.colourId,
        colourName: option.name,
        deliveryChoice: variantPending.deliveryChoice,
        option,
        summary: buildModifySelectionColourReviewPaySummary(
          option,
          variantPending.deliveryChoice,
        ),
        missingRedirect: "/kyc/modify-selection/variant/colour",
        editColourPath: "/kyc/modify-selection/variant/colour",
        editVariantPath: "/kyc/modify-selection/variant",
        carTitle: undefined,
        carVariant: variant.name,
      };
    }

    if (
      flow === "different-car" &&
      differentCarPending != null &&
      brandId != null &&
      modelId != null &&
      differentCarPending.brandId === brandId &&
      differentCarPending.modelId === modelId
    ) {
      const brand = getModifySelectionCarBrandById(brandId);
      const model = getModifySelectionCarModelById(brandId, modelId);
      const variant = findModifySelectionVariantOption(differentCarPending.variantId);
      const option = findModifySelectionColourOption(differentCarPending.colourId);
      if (brand == null || model == null || variant == null || option == null) return null;
      return {
        colourId: differentCarPending.colourId,
        colourName: option.name,
        deliveryChoice: differentCarPending.deliveryChoice,
        option,
        summary: buildModifySelectionColourReviewPaySummary(
          option,
          differentCarPending.deliveryChoice,
        ),
        missingRedirect: modifySelectionDifferentCarColourPath(brandId, modelId),
        editColourPath: modifySelectionDifferentCarColourPath(brandId, modelId),
        editVariantPath: modifySelectionDifferentCarModelPath(brandId, modelId),
        editCarPath: MODIFY_SELECTION_CAR_BRAND_PATH,
        carTitle: `${brand.name} ${model.name}`,
        carVariant: variant.name,
      };
    }

    return null;
  }, [brandId, colourPending, differentCarPending, flow, modelId, variantPending]);

  useEffect(() => {
    if (resolved == null) {
      const fallback =
        flow === "different-car" && brandId != null && modelId != null
          ? modifySelectionDifferentCarColourPath(brandId, modelId)
          : flow === "variant"
            ? "/kyc/modify-selection/variant/colour"
            : "/kyc/modify-selection/colour";
      router.replace(fallback);
    }
  }, [brandId, flow, modelId, resolved, router]);

  const persistDeliveryChoice = useCallback(
    (choice: ModifySelectionDeliveryChoice) => {
      if (flow === "colour" && colourPending != null) {
        const next = { ...colourPending, deliveryChoice: choice };
        writeModifySelectionColourPending(next);
        setColourPending(next);
      } else if (flow === "variant" && variantPending != null) {
        const next = { ...variantPending, deliveryChoice: choice };
        writeModifySelectionVariantPending(next);
        setVariantPending(next);
      } else if (flow === "different-car" && differentCarPending != null) {
        const next = { ...differentCarPending, deliveryChoice: choice };
        writeModifySelectionDifferentCarPending(next);
        setDifferentCarPending(next);
      }
      setDeliverySheetOpen(false);
    },
    [colourPending, differentCarPending, flow, variantPending],
  );

  const scrollToBookingAmount = useCallback(() => {
    const target =
      bookingAmountSectionRef.current ??
      document.getElementById(MODIFY_SELECTION_BOOKING_AMOUNT_SECTION_ID);
    if (target == null) return;
    const headerOffsetPx = 56;
    const top =
      target.getBoundingClientRect().top + window.scrollY - headerOffsetPx;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, []);

  const onEditColour = useCallback(() => {
    if (resolved == null) return;
    router.push(resolved.editColourPath);
  }, [resolved, router]);

  const onEditVariant = useCallback(() => {
    if (resolved?.editVariantPath == null) return;
    router.push(resolved.editVariantPath);
  }, [resolved, router]);

  const onEditCar = useCallback(() => {
    if (resolved == null || !("editCarPath" in resolved) || resolved.editCarPath == null) return;
    router.push(resolved.editCarPath);
  }, [resolved, router]);

  const onEditDelivery = useCallback(() => {
    if (resolved?.option.isExpressDelivery) {
      setDeliverySheetOpen(true);
    }
  }, [resolved?.option.isExpressDelivery]);

  const onPay = useCallback(() => {
    if (resolved == null) return;
    writeModifySelectionPendingFromSummary(resolved.summary, {
      colourId: resolved.colourId,
      colourName: resolved.colourName,
      deliveryChoice: resolved.deliveryChoice,
      carTitle: resolved.carTitle,
      carVariant: resolved.carVariant,
    });
    if (flow === "colour") clearModifySelectionColourPending();
    if (flow === "variant") clearModifySelectionVariantPending();
    if (flow === "different-car") clearModifySelectionDifferentCarPending();
    router.push(
      buildBookingLockCheckoutHref(resolved.summary.bookingAmountToPayInr, {
        returnSource: MODIFY_SELECTION_RETURN_SOURCE,
      }),
    );
  }, [flow, resolved, router]);

  if (resolved == null) {
    return null;
  }

  const expressQuote = resolveModifySelectionColourQuote(resolved.option, "express");

  return (
    <div className="min-h-dvh bg-[#f1f0f5] font-sans">
      <KycTopNavHeader endSlot={<GetHelpPillButton />} />

      <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col px-5 pb-[calc(5rem+32px+env(safe-area-inset-bottom))] pt-2">
        <h1
          className="payment-success-stagger text-2xl font-semibold leading-8 tracking-[-0.1px] text-[#121212]"
          style={{ animationDelay: `${STAGGER_TITLE_MS}ms` }}
        >
          {MODIFY_SELECTION_REVIEW_PAY_TITLE}
        </h1>

        <div
          className="payment-success-stagger mt-5"
          style={{ animationDelay: `${STAGGER_SELECTION_MS}ms` }}
        >
          <ModifySelectionReviewSelectionCard
            colourId={resolved.colourId}
            colourName={resolved.colourName}
            deliveryLine={resolved.summary.deliveryLine}
            isExpressDelivery={resolved.summary.isExpressDelivery}
            onEditColour={onEditColour}
            onEditDelivery={onEditDelivery}
            showDeliveryEdit={resolved.option.isExpressDelivery}
            carTitle={resolved.carTitle}
            carVariant={resolved.carVariant}
            onEditVariant={
              flow === "variant" || flow === "different-car" ? onEditVariant : undefined
            }
            onEditCar={flow === "different-car" ? onEditCar : undefined}
          />
        </div>

        <div
          className="payment-success-stagger"
          style={{ animationDelay: `${STAGGER_BOOKING_MS}ms` }}
        >
          <ModifySelectionReviewBookingAmountCard
            summary={resolved.summary}
            sectionRef={bookingAmountSectionRef}
          />
        </div>

        <div
          className="payment-success-stagger"
          style={{ animationDelay: `${STAGGER_PRICE_MS}ms` }}
        >
          <ModifySelectionReviewPaymentSummary summary={resolved.summary} />
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-10 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_4px_0_rgba(54,53,76,0.06)]">
        <div className="mx-auto flex h-20 w-full max-w-[640px] items-center justify-between gap-3 px-5">
          <div className="min-w-0">
            <p className="text-xs leading-[18px] text-[#757575]">Booking amount</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="text-lg font-semibold leading-6 text-[#121212]">
                {formatModifySelectionInr(resolved.summary.bookingAmountToPayInr)}
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
            {MODIFY_SELECTION_REVIEW_PAY_CTA}
          </button>
        </div>
      </div>

      {resolved.option.isExpressDelivery ? (
        <ModifySelectionDeliveryOptionBottomSheet
          open={deliverySheetOpen}
          onClose={() => setDeliverySheetOpen(false)}
          onConfirm={persistDeliveryChoice}
          initialDeliveryChoice={resolved.deliveryChoice}
          expressDeliveryPriceInr={expressQuote.ackoDrivePriceInr}
          expressDeliveryLine={resolved.option.deliveryLine}
        />
      ) : null}
    </div>
  );
}
