"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { ConciergeTurnShell } from "@/components/concierge/ConciergeTurnShell";
import { writeChangeEntryStage } from "@/lib/change-policy";
import { writeConciergeEcho } from "@/lib/concierge/echo";
import { DEFAULT_DEALER_VISIBILITY, isAckoOnly, readDealerVisibility } from "@/lib/dealer-visibility";
import { writeExperienceFlow } from "@/lib/experience-flow";
import { JOURNEY_PATHS } from "@/lib/journey-routes";
import { BOOKING_LOCK_AMOUNT_INR } from "@/lib/paymentUrls";
import { cn } from "@/lib/utils";

const LOCK_AMOUNT = `₹${BOOKING_LOCK_AMOUNT_INR.toLocaleString("en-IN")}`;

/**
 * Allocation failed — ACKO couldn't source the exact car in the promised
 * window. Policy §1.14: our failure is never the customer's cost. The three
 * ways forward are shown as cards (not bare buttons), and the two that keep the
 * purchase alive lead with the one thing the customer fears: their money. It's
 * safe and carries over automatically — no fee, nothing to re-pay.
 */
export function ConciergeAllocationFailedScreen() {
  const router = useRouter();
  const [dealerVisibility, setDealerVisibility] = useState(DEFAULT_DEALER_VISIBILITY);

  useEffect(() => {
    setDealerVisibility(readDealerVisibility());
  }, []);

  const reason = isAckoOnly(dealerVisibility)
    ? `We couldn't source your exact Creta on the express timeline. This one's on me, not you — so whatever you choose below, your ${LOCK_AMOUNT} stays exactly where it is and comes with you.`
    : `The dealer fell through, and no one nearby has your exact Creta on the express timeline. This one's on me, not you — so whatever you choose below, your ${LOCK_AMOUNT} stays exactly where it is and comes with you.`;

  const chooseStandard = () => {
    writeExperienceFlow("standard");
    writeConciergeEcho("I'll wait for standard delivery");
    router.push(JOURNEY_PATHS.kyc.bookingAccepted);
  };

  const chooseOtherCar = () => {
    writeChangeEntryStage("pre");
    writeConciergeEcho("Let's pick a different car");
    router.push(JOURNEY_PATHS.kyc.modifySelection);
  };

  const chooseRefund = () => {
    router.push(
      `${JOURNEY_PATHS.kyc.cancelBooking}?paid=${BOOKING_LOCK_AMOUNT_INR}&reason=our-failure`,
    );
  };

  return (
    <ConciergeTurnShell
      says={["I'm sorry, Sharath. I couldn't find your car.", reason]}
      dateHolder="you"
      artifact={
        <div className="flex flex-col gap-3">
          <OptionCard
            title="Wait for standard delivery"
            chip="About 3 months"
            highlight
            body="Same Creta, same spec — I just source it on the standard timeline instead of express. It takes a little longer, around three months."
            reassurance={`Your ${LOCK_AMOUNT} carries straight over — nothing more to pay now.`}
            onClick={chooseStandard}
          />
          <OptionCard
            title="Pick a different car"
            body="Choose another car that can reach you sooner. I'll show you what's available right away."
            reassurance={`Your ${LOCK_AMOUNT} moves to it automatically — and since this was on us, there's no change fee.`}
            onClick={chooseOtherCar}
          />
          <OptionCard
            title="Get a full refund"
            body="Prefer to step away for now? No hard feelings, and the door stays open."
            reassurance={`The full ${LOCK_AMOUNT} comes straight back to your account.`}
            onClick={chooseRefund}
          />
        </div>
      }
      callLabel="Want to talk it through? I can call you"
    />
  );
}

function OptionCard({
  title,
  chip,
  body,
  reassurance,
  highlight,
  onClick,
}: {
  title: string;
  chip?: string;
  body: string;
  reassurance: string;
  highlight?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full rounded-2xl bg-white p-4 text-left card-elevated transition-transform active:scale-[0.99]",
        highlight && "ring-1 ring-[#0fa457]/35",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-semibold leading-5 text-[#121212]">{title}</h3>
            {chip ? (
              <span className="rounded-full bg-[#eef6ff] px-2 py-0.5 text-[11px] font-medium text-[#1b73e8]">
                {chip}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[13px] leading-[18px] text-[#4b4b4b]">{body}</p>
          <p className="mt-2.5 flex items-start gap-1.5 text-[12px] font-medium leading-[17px] text-[#0c7a42]">
            <ShieldCheckIcon />
            <span>{reassurance}</span>
          </p>
        </div>
        <svg
          className="mt-1 h-5 w-5 shrink-0 text-[#c2c2c2] transition-colors group-hover:text-[#757575]"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </button>
  );
}

function ShieldCheckIcon(): ReactNode {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className="mt-px shrink-0"
      aria-hidden
    >
      <path
        d="M12 3l7 3v5c0 4.4-3 8.2-7 9-4-0.8-7-4.6-7-9V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
