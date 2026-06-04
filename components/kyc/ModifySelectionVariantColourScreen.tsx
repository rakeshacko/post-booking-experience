"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { KycTopNavHeader } from "@/components/kyc/KycTopNavHeader";
import { ModifySelectionColourCard } from "@/components/kyc/ModifySelectionColourCard";
import { ModifySelectionDeliveryOptionBottomSheet } from "@/components/kyc/ModifySelectionDeliveryOptionBottomSheet";
import {
  getModifySelectionAvailableColourOptions,
  type ModifySelectionDeliveryChoice,
} from "@/lib/modify-selection-colours-content";
import {
  clearModifySelectionVariantChoice,
  readModifySelectionVariantChoice,
} from "@/lib/modify-selection-variant-choice";
import { writeModifySelectionVariantPending } from "@/lib/modify-selection-variant-pending";
import {
  findModifySelectionVariantOption,
  modifySelectionVariantColourScreenTitle,
  MODIFY_SELECTION_VARIANT_CONFIRM_PATH,
} from "@/lib/modify-selection-variants-content";
import {
  modifySelectionListStaggerDelay,
  MODIFY_SELECTION_STAGGER_MS,
} from "@/lib/modify-selection-stagger";

const { title: STAGGER_TITLE_MS, section: STAGGER_FIRST_COLOUR_MS } = MODIFY_SELECTION_STAGGER_MS;

const COLOUR_LIST_ARIA_LABEL = "Available colours";

/**
 * Change variant — pick colour after variant.
 */
export function ModifySelectionVariantColourScreen() {
  const router = useRouter();
  const [variantId, setVariantId] = useState<string | null>(() =>
    readModifySelectionVariantChoice(),
  );
  const availableColours = useMemo(() => getModifySelectionAvailableColourOptions(), []);
  const [selectedColourId, setSelectedColourId] = useState<string | null>(null);
  const [deliverySheetOpen, setDeliverySheetOpen] = useState(false);

  const selectedVariant = useMemo(
    () => (variantId != null ? findModifySelectionVariantOption(variantId) : undefined),
    [variantId],
  );

  const selectedColour = useMemo(
    () => availableColours.find((option) => option.id === selectedColourId) ?? null,
    [availableColours, selectedColourId],
  );

  useEffect(() => {
    setVariantId(readModifySelectionVariantChoice());
  }, []);

  useEffect(() => {
    if (variantId == null || selectedVariant == null) {
      router.replace("/kyc/modify-selection/variant");
    }
  }, [router, selectedVariant, variantId]);

  const goToConfirmation = useCallback(
    (deliveryChoice: ModifySelectionDeliveryChoice) => {
      if (selectedVariant == null || selectedColour == null || variantId == null) return;
      writeModifySelectionVariantPending({
        variantId,
        colourId: selectedColour.id,
        deliveryChoice,
      });
      clearModifySelectionVariantChoice();
      setDeliverySheetOpen(false);
      router.push(MODIFY_SELECTION_VARIANT_CONFIRM_PATH);
    },
    [router, selectedColour, selectedVariant, variantId],
  );

  const onContinue = useCallback(() => {
    if (selectedColour == null) return;
    if (selectedColour.isExpressDelivery) {
      setDeliverySheetOpen(true);
      return;
    }
    goToConfirmation("standard");
  }, [goToConfirmation, selectedColour]);

  const onDeliveryConfirm = useCallback(
    (deliveryChoice: ModifySelectionDeliveryChoice) => {
      goToConfirmation(deliveryChoice);
    },
    [goToConfirmation],
  );

  if (variantId == null || selectedVariant == null) {
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
          {modifySelectionVariantColourScreenTitle(selectedVariant.name)}
        </h1>

        <div
          className="mt-5 flex flex-col gap-3"
          role="group"
          aria-label={COLOUR_LIST_ARIA_LABEL}
        >
          {availableColours.map((option, index) => (
            <div
              key={option.id}
              className="payment-success-stagger w-full"
              style={{
                animationDelay: `${modifySelectionListStaggerDelay(index, STAGGER_FIRST_COLOUR_MS)}ms`,
              }}
            >
              <ModifySelectionColourCard
                option={option}
                selected={selectedColourId === option.id}
                onSelect={() => setSelectedColourId(option.id)}
              />
            </div>
          ))}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-10 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_6px_0_rgba(54,53,76,0.08)]">
        <div className="mx-auto w-full max-w-[640px] bg-white px-5 py-4">
          <button
            type="button"
            disabled={selectedColourId == null}
            onClick={onContinue}
            className="primary-cta w-full focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#a0a0a0] disabled:opacity-100 disabled:hover:bg-[#a0a0a0]"
          >
            Continue
          </button>
        </div>
      </div>

      {selectedColour?.isExpressDelivery ? (
        <ModifySelectionDeliveryOptionBottomSheet
          open={deliverySheetOpen}
          onClose={() => setDeliverySheetOpen(false)}
          onConfirm={onDeliveryConfirm}
          expressDeliveryPriceInr={selectedColour.ackoDrivePriceInr}
          expressDeliveryLine={selectedColour.deliveryLine}
        />
      ) : null}
    </div>
  );
}
