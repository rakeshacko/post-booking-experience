import carAllocationHero from "@/assets/Car allocation.svg";

import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";

/**
 * After booking celebration “Okay” — same shell as `/kyc/processing`; Next → allocation confirmed.
 */
export default function CarAllocationPendingPage() {
  return (
    <KycBookingProcessingScreen
      headline="A car is being assigned to your booking, Sharath"
      subline="We are working with Advaith Hyundai to allocate your exact Creta variant and colour. This usually takes 24-48 hours."
      infoBox={{
        body: "Once allocated, you will receive your car's engine and chassis number.",
      }}
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
