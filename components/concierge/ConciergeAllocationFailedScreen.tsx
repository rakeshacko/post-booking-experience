"use client";

import { useRouter } from "next/navigation";

import { ConciergeTurnShell } from "@/components/concierge/ConciergeTurnShell";
import { writeChangeEntryStage } from "@/lib/change-policy";
import { writeConciergeEcho } from "@/lib/concierge/echo";
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

  return (
    <ConciergeTurnShell
      says={[
        "I couldn't find your car, Sharath — I'm sorry.",
        "Advaith Hyundai's allocation fell through, and no dealer near you has your exact Creta on the express timeline. This one is on us, not you — so every option below is free, and your money is never stuck.",
      ]}
      replies={[
        {
          label: "I'll wait — switch me to standard delivery",
          onClick: () => {
            // The same car on the honest longer clock — delivery moves to 25 Oct '26.
            writeExperienceFlow("standard");
            writeConciergeEcho("Okay — standard delivery it is");
            router.push(JOURNEY_PATHS.carAllocation.pending);
          },
          echo: null,
        },
        {
          label: "Show me different cars — free change",
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
      footnote="All three options are free — this one's on us"
      callLabel="Annoyed? Fair. I can call you"
    />
  );
}
