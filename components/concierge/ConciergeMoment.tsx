"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import infoIcon from "@/assets/Info.svg";

import {
  AmountReceivedCard,
  CarSummaryCardLite,
  NextStepCard,
  NoteCallout,
  PlanList,
  type PlanItem,
} from "@/components/concierge/artifacts";
import { ConciergeTurnShell, type ConciergeTurn } from "@/components/concierge/ConciergeTurnShell";
import {
  BOOKING_CAR_COLOR,
  BOOKING_CAR_TITLE,
  BOOKING_CAR_VARIANT,
} from "@/components/kyc/booking-car-card-content";
import {
  DEMO_VEHICLE_CHASSIS_NO,
  DEMO_VEHICLE_ENGINE_NO,
} from "@/components/kyc/demo-vehicle-identification";
import { PaymentSummaryCard } from "@/components/payment/PaymentSummaryCard";
import { ShimmerInfoCard } from "@/components/ui/ShimmerInfoCard";
import { readActiveBookingSnapshot } from "@/lib/active-booking-snapshot";
import { ARRIVAL_LEAD_PAID, getTurnWords, type ConciergeMomentId } from "@/lib/concierge/script";
import {
  DEFAULT_DEALER_VISIBILITY,
  isAckoOnly,
  readDealerVisibility,
  resolveDealerAttribution,
  type DealerVisibility,
} from "@/lib/dealer-visibility";
import {
  DEFAULT_EXPERIENCE_FLOW,
  isCancelNoChargesFlow,
  readExperienceFlow,
  type ExperienceFlow,
} from "@/lib/experience-flow";
import {
  getBookingDeliveryLine,
  getBookingDeliveryTextClass,
} from "@/lib/experience-flow-content";
import { JOURNEY_PATHS } from "@/lib/journey-routes";
import { recordKycVerificationFailure } from "@/lib/kyc-verification-attempts";
import {
  getKycVerificationNextHref,
  KYC_VERIFICATION_FAILED_HREF,
} from "@/lib/kyc-verification-outcome";
import { BOOKING_LOCK_AMOUNT_INR } from "@/lib/paymentUrls";

export type ConciergeMomentProps = {
  moment: ConciergeMomentId;
};

/**
 * One scripted moment of the concierge journey — resolves the active flow,
 * pulls Shivi's words from the script, and assembles the turn (artifacts,
 * routes, demo time-skips) for the shell.
 */
export function ConciergeMoment({ moment }: ConciergeMomentProps) {
  const router = useRouter();
  const [flow, setFlow] = useState<ExperienceFlow>(DEFAULT_EXPERIENCE_FLOW);
  const [dealerVisibility, setDealerVisibility] = useState<DealerVisibility>(
    DEFAULT_DEALER_VISIBILITY,
  );
  const [flowReady, setFlowReady] = useState(false);
  /** Arrival only — the price-lock payment settles while Shivi talks. */
  const [arrivalPaid, setArrivalPaid] = useState(false);

  useEffect(() => {
    setFlow(readExperienceFlow());
    setDealerVisibility(readDealerVisibility());
    setFlowReady(true);
  }, []);

  const ackoOnly = isAckoOnly(dealerVisibility);
  const words = useMemo(
    () => getTurnWords(moment, flow, ackoOnly),
    [moment, flow, ackoOnly],
  );
  /** Who the car is attributed to on cards — the dealer, or AckoDrive when hidden. */
  const dealer = useMemo(
    () => resolveDealerAttribution(dealerVisibility),
    [dealerVisibility],
  );

  /** Car details — honour an updated selection from the modify flows. */
  const car = useMemo(() => {
    if (!flowReady) {
      return { title: BOOKING_CAR_TITLE, variant: BOOKING_CAR_VARIANT, colour: BOOKING_CAR_COLOR };
    }
    const snapshot = readActiveBookingSnapshot();
    return {
      title: snapshot?.carTitle ?? BOOKING_CAR_TITLE,
      variant: snapshot?.carVariant ?? BOOKING_CAR_VARIANT,
      colour: snapshot?.colourName ?? BOOKING_CAR_COLOR,
    };
  }, [flowReady]);

  const deliveryLine = getBookingDeliveryLine(flow);
  const deliveryLineClass = getBookingDeliveryTextClass(flow);

  const turn: ConciergeTurn & { hideBack?: boolean } = useMemo(() => {
    const base: ConciergeTurn & { hideBack?: boolean } = {
      dayStamp: words.dayStamp,
      says: words.says,
      footnote: words.footnote,
      callLabel: words.callLabel,
    };

    const primaryReply = (href: string) =>
      words.replyLabel
        ? [{ label: words.replyLabel, href, echo: words.replyEcho }]
        : undefined;

    const working = words.workingLines
      ? {
          lines: words.workingLines,
          mode: words.workingMode,
          doneLabel: words.workingDoneLabel,
          etaLabel: words.workingEtaLabel,
          doneCount: words.workingDoneCount,
        }
      : undefined;

    switch (moment) {
      case "arrival": {
        const planItems: PlanItem[] = [
          {
            icon: "documents",
            title: "Share your PAN & Aadhaar",
            detail: "Two minutes, right now — I file everything else.",
          },
          {
            icon: "car",
            title: "I find your exact car",
            detail: "Your variant and colour, reserved in your name with a dealer.",
          },
          {
            icon: "money",
            title: "We sort the money",
            detail: "Finance through me or your own bank — your call.",
          },
          {
            icon: "delivery",
            title: "Your Creta arrives",
            detail: deliveryLine,
          },
        ];
        return {
          ...base,
          says: arrivalPaid ? [ARRIVAL_LEAD_PAID, ...base.says.slice(1)] : base.says,
          hideBack: true,
          afterLead: (
            <AmountReceivedCard
              amountInr={BOOKING_LOCK_AMOUNT_INR}
              status={arrivalPaid ? "received" : "processing"}
              title={arrivalPaid ? "Payment received" : "Payment processing…"}
            />
          ),
          artifact: <PlanList items={planItems} />,
          replies: primaryReply(JOURNEY_PATHS.kyc.hub),
        };
      }

      case "documentsReceived": {
        // OCR verifies in-session — no queue screen. Failure surfaces right here;
        // the cancel-no-charges demo still parks on the holding turn.
        const failed = getKycVerificationNextHref() === KYC_VERIFICATION_FAILED_HREF;
        const nextHref = isCancelNoChargesFlow(flow)
          ? JOURNEY_PATHS.kyc.verificationInProgress
          : JOURNEY_PATHS.kyc.processing;
        return {
          ...base,
          working:
            working && failed
              ? { ...working, doneLabel: "Hmm — one detail needs a second look" }
              : working,
          replies: failed
            ? [
                {
                  label: "Show me what's wrong",
                  echo: "Show me what's wrong",
                  onClick: () => {
                    recordKycVerificationFailure();
                    router.push(KYC_VERIFICATION_FAILED_HREF);
                  },
                },
              ]
            : primaryReply(nextHref),
        };
      }

      case "verificationInProgress": {
        const nextHref = getKycVerificationNextHref();
        const hideSkip = isCancelNoChargesFlow(flow);
        return {
          ...base,
          artifact: (
            <NoteCallout iconSrc={infoIcon}>
              Nothing needed from you right now — I&apos;ll message you the moment there&apos;s
              news.
            </NoteCallout>
          ),
          timeSkip:
            words.timeSkipLabel && !hideSkip
              ? {
                  label: words.timeSkipLabel,
                  href: nextHref,
                  onBeforeNavigate:
                    nextHref === KYC_VERIFICATION_FAILED_HREF
                      ? recordKycVerificationFailure
                      : undefined,
                }
              : undefined,
        };
      }

      case "dealerSearch":
        return {
          ...base,
          working,
          footnoteInline: true,
          timeSkip: words.timeSkipLabel
            ? { label: words.timeSkipLabel, href: JOURNEY_PATHS.kyc.bookingAccepted }
            : undefined,
          // A dealer is only assigned once a car is found, so the no-car branch
          // lives here. Past this point a dealer (and the car) is secured.
          altTimeSkip: { label: "If no car is found", href: JOURNEY_PATHS.carAllocation.failed },
        };

      case "dealerFound": {
        const deliveryDate = deliveryLine
          .replace("Express delivery by", "")
          .replace("Standard delivery by", "")
          .trim();
        return {
          ...base,
          // Revealed: the dealer's call is the action (demo time-skip). AckoDrive-only:
          // the on-screen OTP is the action, so it gets a reply button.
          dateHolder: "you",
          artifact: (
            <>
              <CarSummaryCardLite
                hero="dealer"
                title={car.title}
                variant={car.variant}
                colour={car.colour}
                deliveryLine={deliveryLine}
                deliveryLineClassName={deliveryLineClass}
                dealerName={dealer.name}
                dealerDetail={dealer.detail}
                engineNo={DEMO_VEHICLE_ENGINE_NO}
                chassisNo={DEMO_VEHICLE_CHASSIS_NO}
              />
              {ackoOnly ? (
                <NextStepCard
                  title="Confirm with a one-time code"
                  body="I'll trigger an OTP on your phone, you enter it on the next screen, and the car is locked to you. No dealer call — I handle that in the background."
                  etaLabel="Under a minute"
                />
              ) : (
                <>
                  <NextStepCard
                    title={`Pick up ${dealer.name}'s call`}
                    body="An OTP will land on your phone — read it back to them to lock the car."
                    etaLabel="Expected today, before 6:00 PM"
                  />
                  <ShimmerInfoCard icon="alert">
                    If the call slips, your reservation — and your {deliveryDate} delivery — can
                    slip with it.
                  </ShimmerInfoCard>
                </>
              )}
              <p className="px-1 text-xs leading-[18px] text-[#757575]">
                Second thoughts? One change costs ₹5,000; cancelling holds back 50% of what
                you&apos;ve paid — both live in the ⋮ menu up top.
              </p>
            </>
          ),
          replies: ackoOnly
            ? [
                {
                  label: "Confirm with OTP",
                  href: JOURNEY_PATHS.kyc.otpVerify,
                  echo: "Confirm with OTP",
                },
              ]
            : undefined,
          timeSkip:
            !ackoOnly && words.timeSkipLabel
              ? { label: words.timeSkipLabel, href: JOURNEY_PATHS.kyc.bookingConfirmed }
              : undefined,
        };
      }

      case "carReserved":
        // OTP locked the exact unit found at dealer-found — engine/chassis and
        // all. The car is fully settled here; next stop is the money.
        return {
          ...base,
          artifact: (
            <CarSummaryCardLite
              title={car.title}
              variant={car.variant}
              colour={car.colour}
              statusChip="Yours ✓"
              deliveryLine={deliveryLine}
              deliveryLineClassName={deliveryLineClass}
              dealerName={dealer.name}
              dealerDetail={dealer.detail}
              engineNo={DEMO_VEHICLE_ENGINE_NO}
              chassisNo={DEMO_VEHICLE_CHASSIS_NO}
            />
          ),
          replies: primaryReply(JOURNEY_PATHS.payment.default),
        };

      case "moneyIntro":
        return {
          ...base,
          artifact: <PaymentSummaryCard />,
          replies: primaryReply(JOURNEY_PATHS.payment.choose),
        };
    }
  }, [
    moment,
    words,
    flow,
    car,
    deliveryLine,
    deliveryLineClass,
    arrivalPaid,
    router,
    ackoOnly,
    dealer,
  ]);

  const { hideBack, ...turnProps } = turn;

  return (
    <ConciergeTurnShell
      {...turnProps}
      hideBack={hideBack}
      onContentShown={moment === "arrival" ? () => setArrivalPaid(true) : undefined}
    />
  );
}

export type { ConciergeMomentId };

/** Convenience wrappers so app pages stay one-liners. */
export function ConciergeMomentPage({ moment }: { moment: ConciergeMomentId }): ReactNode {
  return <ConciergeMoment moment={moment} />;
}
