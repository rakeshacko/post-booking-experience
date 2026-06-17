"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ConciergeTurnShell } from "@/components/concierge/ConciergeTurnShell";
import { writeChangeEntryStage } from "@/lib/change-policy";
import { writeConciergeEcho } from "@/lib/concierge/echo";
import { DEFAULT_DEALER_VISIBILITY, isAckoOnly, readDealerVisibility } from "@/lib/dealer-visibility";
import { writeExperienceFlow } from "@/lib/experience-flow";
import { JOURNEY_PATHS } from "@/lib/journey-routes";
import { BOOKING_LOCK_AMOUNT_INR } from "@/lib/paymentUrls";

/**
 * Allocation failed — ACKO couldn't source the exact car in the promised
 * window. Policy §1.14: our failure is never the customer's cost, so every
 * way out is free — full refund, a switch to the standard timeline, or a
 * free car change that does NOT consume the one-time change allowance.
 */
export function ConciergeAllocationFailedScreen() {
  const router = useRouter();
  const [dealerVisibility, setDealerVisibility] = useState(DEFAULT_DEALER_VISIBILITY);

  useEffect(() => {
    setDealerVisibility(readDealerVisibility());
  }, []);

  const reason = isAckoOnly(dealerVisibility)
    ? "We couldn't source your exact Creta on the express timeline. This one is on us, not you, so every option below is free and your money stays safe."
    : "The dealer fell through, and no one nearby has your exact Creta on the express timeline. This one is on us, not you, so every option below is free and your money stays safe.";

  return (
    <ConciergeTurnShell
      says={["I'm sorry, Sharath. I couldn't find your car.", reason]}
      replies={[
        {
          label: "I'll wait for standard delivery",
          onClick: () => {
            // The same car on the honest longer clock — delivery moves to 25 Oct '26.
            // Re-enter at the dealer-found turn: on standard the car gets sourced.
            writeExperienceFlow("standard");
            writeConciergeEcho("I'll wait for standard delivery");
            router.push(JOURNEY_PATHS.kyc.bookingAccepted);
          },
          echo: null,
        },
        {
          label: "Show me other cars",
          kind: "soft",
          onClick: () => {
            // Our failure: the change is free and doesn't consume the one-time allowance.
            writeChangeEntryStage("pre");
            writeConciergeEcho("Let's pick a different car");
            router.push(JOURNEY_PATHS.kyc.modifySelection);
          },
          echo: null,
        },
        {
          label: "Cancel and refund everything",
          kind: "soft",
          href: `${JOURNEY_PATHS.kyc.cancelBooking}?paid=${BOOKING_LOCK_AMOUNT_INR}&reason=our-failure`,
          echo: null,
        },
      ]}
      footnote="All three options are free. This one's on us."
      callLabel="Want to talk it through? I can call you"
    />
  );
}
