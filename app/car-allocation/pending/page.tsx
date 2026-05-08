import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";

/**
 * After booking celebration “Okay” — same shell as `/kyc/processing`; Next → allocation confirmed.
 */
export default function CarAllocationPendingPage() {
  return (
    <KycBookingProcessingScreen
      headline="We're allocating your car, Sharath!"
      subline="Hang tight — we're matching your selected variant and colour to available stock."
      nextHref="/car-allocation/confirmed"
      prefetchHref="/car-allocation/confirmed"
    />
  );
}
