"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { BookingCarSummaryCard } from "@/components/kyc/BookingCarSummaryCard";
import { KycTopNavHeader } from "@/components/kyc/KycTopNavHeader";
import { ModifySelectionColourCard } from "@/components/kyc/ModifySelectionColourCard";
import { ModifySelectionDeliveryOptionBottomSheet } from "@/components/kyc/ModifySelectionDeliveryOptionBottomSheet";
import {
  getModifySelectionAvailableColourOptions,
  MODIFY_SELECTION_AVAILABLE_COLOURS_HEADING,
  MODIFY_SELECTION_COLOUR_CONFIRM_PATH,
  MODIFY_SELECTION_COLOUR_SCREEN_TITLE,
  type ModifySelectionDeliveryChoice,
} from "@/lib/modify-selection-colours-content";
import { MODIFY_SELECTION_CURRENT_SELECTION_HEADING } from "@/lib/modify-selection-content";
import { writeModifySelectionColourPending } from "@/lib/modify-selection-colour-pending";
import {
  modifySelectionCardStaggerDelay,
  MODIFY_SELECTION_STAGGER_MS,
} from "@/lib/modify-selection-stagger";

/** Stagger: nav + footer CTA immediate; then title → summary → heading → colour cards. */
const {
  title: STAGGER_TITLE_MS,
  section: STAGGER_CAR_SUMMARY_MS,
  heading: STAGGER_SECTION_HEADING_MS,
  firstCard: STAGGER_FIRST_COLOUR_MS,
} = MODIFY_SELECTION_STAGGER_MS;

/**
 * Change colour — booked car summary + available colour cards (Figma 2672:10452).
 */
export function ModifySelectionColourScreen() {
  const router = useRouter();
  const availableColours = useMemo(() => getModifySelectionAvailableColourOptions(), []);
  const [selectedColourId, setSelectedColourId] = useState<string | null>(null);
  const [deliverySheetOpen, setDeliverySheetOpen] = useState(false);

  const selectedColour = useMemo(
    () => availableColours.find((option) => option.id === selectedColourId) ?? null,
    [availableColours, selectedColourId],
  );

  const goToConfirmation = useCallback(
    (deliveryChoice: ModifySelectionDeliveryChoice) => {
      if (selectedColour == null) return;
      writeModifySelectionColourPending({
        colourId: selectedColour.id,
        deliveryChoice,
      });
      setDeliverySheetOpen(false);
      router.push(MODIFY_SELECTION_COLOUR_CONFIRM_PATH);
    },
    [router, selectedColour],
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

  return (
    <div className="min-h-dvh bg-white font-sans">
      <KycTopNavHeader />

      <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col px-5 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-2">
        <h1
          className="payment-success-stagger text-2xl font-semibold leading-8 tracking-tight text-[#121212]"
          style={{ animationDelay: `${STAGGER_TITLE_MS}ms` }}
        >
          {MODIFY_SELECTION_COLOUR_SCREEN_TITLE}
        </h1>

        <section
          className="payment-success-stagger mb-[24px] mt-5"
          style={{ animationDelay: `${STAGGER_CAR_SUMMARY_MS}ms` }}
          aria-labelledby="modify-selection-current-selection-heading"
        >
          <h2
            id="modify-selection-current-selection-heading"
            className="text-sm font-medium leading-5 text-[#757575]"
          >
            {MODIFY_SELECTION_CURRENT_SELECTION_HEADING}
          </h2>
          <div className="mt-3">
            <BookingCarSummaryCard variant="detailsOnly" />
          </div>
        </section>

        <h2
          className="payment-success-stagger text-sm font-medium leading-5 text-[#757575]"
          style={{ animationDelay: `${STAGGER_SECTION_HEADING_MS}ms` }}
        >
          {MODIFY_SELECTION_AVAILABLE_COLOURS_HEADING}
        </h2>

        <div className="mt-4 flex flex-col gap-3" role="group" aria-label={MODIFY_SELECTION_AVAILABLE_COLOURS_HEADING}>
          {availableColours.map((option, index) => (
            <div
              key={option.id}
              className="payment-success-stagger w-full"
              style={{
                animationDelay: `${modifySelectionCardStaggerDelay(index, STAGGER_FIRST_COLOUR_MS)}ms`,
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
