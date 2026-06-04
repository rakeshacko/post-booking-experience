"use client";

import { useMemo } from "react";

import carAllocationHero from "@/assets/Car allocation.svg";

import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";
import { HeroLabelValueSummaryCard } from "@/components/ui/HeroLabelValueSummaryCard";
import {
  CAR_ALLOCATION_PENDING_ALLOCATION_BY_DATE,
  CAR_ALLOCATION_PENDING_INFO_BOX_EXPRESS,
  CAR_ALLOCATION_PENDING_SUMMARY_DESCRIPTION_STANDARD,
  CAR_ALLOCATION_PENDING_SUMMARY_LABEL_STANDARD,
  getCarAllocationPendingSubline,
  isStandardDeliveryFlow,
} from "@/lib/experience-flow-content";

/**
 * Car allocation pending — standard uses label/value summary card; express uses info callout.
 */
export function CarAllocationPendingPageClient() {
  const standardFlow = isStandardDeliveryFlow();

  const heroSummaryCard = useMemo(() => {
    if (!standardFlow) return undefined;
    return (
      <HeroLabelValueSummaryCard
        ariaLabel="Car allocation summary"
        label={CAR_ALLOCATION_PENDING_SUMMARY_LABEL_STANDARD}
        value={CAR_ALLOCATION_PENDING_ALLOCATION_BY_DATE}
        description={CAR_ALLOCATION_PENDING_SUMMARY_DESCRIPTION_STANDARD}
      />
    );
  }, [standardFlow]);

  const infoBox = useMemo(() => {
    if (standardFlow) return undefined;
    return { body: CAR_ALLOCATION_PENDING_INFO_BOX_EXPRESS };
  }, [standardFlow]);

  return (
    <KycBookingProcessingScreen
      headline="A car is being assigned to your booking, Sharath"
      subline={getCarAllocationPendingSubline()}
      infoBox={infoBox}
      heroSummaryCard={heroSummaryCard}
      nextHref="/car-allocation/confirmed"
      prefetchHref="/car-allocation/confirmed"
      whatsNextFirstStepStatus="in_progress"
      whatsNextFirstStepDescription="Your selected variant and colour are being matched to available stock."
      heroIllustrationSrc={carAllocationHero}
      heroIllustrationWidth={280}
      heroIllustrationHeight={80}
    />
  );
}
