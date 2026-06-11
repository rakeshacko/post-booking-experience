import { Suspense } from "react";

import { ConciergeCancelScreen } from "@/components/concierge/ConciergeCancelScreen";

/**
 * Cancellation — available in every flow at every stage (policy §7):
 * free before Booking Confirmation, 50% of total paid after.
 */
export default function CancelBookingPage() {
  return (
    <Suspense fallback={null}>
      <ConciergeCancelScreen />
    </Suspense>
  );
}
