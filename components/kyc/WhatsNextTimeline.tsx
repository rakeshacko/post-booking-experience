"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { KYC_ASSETS } from "@/components/kyc/kyc-assets";

export type WhatsNextTimelineVariant = "default" | "compact";

export type WhatsNextTimelineSurface = "card" | "flat";

export type TimelineStepStatus = "done" | "in_progress" | "next";

/** Nested rows under the main “Payment” timeline step (self finance only). */
export type WhatsNextTimelinePaymentSubStep = {
  title: string;
  description?: string;
  status: TimelineStepStatus;
};

export type WhatsNextTimelineProps = {
  /** Typically in progress (e.g. Car allocation). */
  firstStepTitle: string;
  firstStepDescription: string;
  /** Typically next (e.g. Payment). */
  secondStepTitle: string;
  secondStepDescription: string;
  /** Typically next (e.g. Car delivery). */
  thirdStepTitle: string;
  thirdStepDescription: string;
  /** Icon + title weight for each row (defaults: allocation in progress, payment & delivery next). */
  firstStepStatus?: TimelineStepStatus;
  secondStepStatus?: TimelineStepStatus;
  thirdStepStatus?: TimelineStepStatus;
  /**
   * `compact` — flat card + tighter gaps ([Figma 1961:7224 — Dev](https://www.figma.com/design/nW5SWmJdxxsCEDlqBN7C0L/Post-booking-experience?node-id=1961-7224&m=dev)), used on loan processing only.
   * `default` — elevated card (e.g. payment default).
   */
  variant?: WhatsNextTimelineVariant;
  /**
   * `card` — bordered panel with inner padding (e.g. `/payment/default`).
   * `flat` — rail only: aligns with parent `px-5` (e.g. `WhatsNextTimelineBottomSheet` header).
   */
  surface?: WhatsNextTimelineSurface;
  /**
   * When set (e.g. self finance), renders a nested checklist under the second step copy.
   * Does not add main-rail icons — connector math stays 3-step.
   */
  paymentSubSteps?: WhatsNextTimelinePaymentSubStep[];
};

function timelineStepTitleClassName(status: TimelineStepStatus) {
  const weight = status === "in_progress" ? "font-medium" : "font-normal";
  return `text-sm ${weight} leading-5 text-[#121212]`;
}

/** Subtext stays regular weight; only step titles vary by status. */
const TIMELINE_STEP_DESCRIPTION_CLASS =
  "mt-1 text-xs font-normal leading-[18px] text-[#757575]";

/** Completed / active connector — matches `LoanProcessingWhatsNext` main rail. */
const CONNECTOR_ACTIVE = "#138808";

type LineSeg = { top: number; height: number };

const EMPTY_LINE: LineSeg = { top: 0, height: 0 };

function TimelineStepIcon({ status }: { status: TimelineStepStatus }) {
  const src =
    status === "done"
      ? KYC_ASSETS.timelineDone
      : status === "in_progress"
        ? KYC_ASSETS.timelineInProgress
        : KYC_ASSETS.timelineNext;
  const label =
    status === "done" ? "Done" : status === "in_progress" ? "In progress" : "Up next";

  return (
    <span className="relative flex h-6 w-6 shrink-0 items-center justify-center" title={label}>
      <Image src={src} alt={label} fill className="object-contain" unoptimized sizes="24px" />
    </span>
  );
}

function TimelinePaymentSubStepIcon({ status }: { status: TimelineStepStatus }) {
  const src =
    status === "done"
      ? KYC_ASSETS.timelineDone
      : status === "in_progress"
        ? KYC_ASSETS.timelineInProgress
        : KYC_ASSETS.timelineNext;
  const label =
    status === "done" ? "Done" : status === "in_progress" ? "In progress" : "Up next";

  return (
    <span
      className="relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center"
      title={label}
    >
      <Image src={src} alt={label} fill className="object-contain" unoptimized sizes="16px" />
    </span>
  );
}

function timelinePaymentSubStepTitleClassName(status: TimelineStepStatus) {
  const weight = status === "in_progress" ? "font-medium" : "font-normal";
  return `text-xs ${weight} leading-[18px] text-[#121212]`;
}

/**
 * Vertical connectors: green through completed steps up to `in_progress`; grey for the rest.
 * When every step is still “up next”, the full rail stays grey.
 * Spans the center of the first icon to the center of the last.
 * Row height depends on copy (wrapping), so we measure after layout.
 * [Figma 2052:7630](https://www.figma.com/design/nW5SWmJdxxsCEDlqBN7C0L/Post-booking-experience?node-id=2052-7630)
 */
export function WhatsNextTimeline({
  firstStepTitle,
  firstStepDescription,
  secondStepTitle,
  secondStepDescription,
  thirdStepTitle,
  thirdStepDescription,
  firstStepStatus = "in_progress",
  secondStepStatus = "next",
  thirdStepStatus = "next",
  variant = "default",
  surface = "card",
  paymentSubSteps,
}: WhatsNextTimelineProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const icon1Ref = useRef<HTMLDivElement>(null);
  const icon2Ref = useRef<HTMLDivElement>(null);
  const icon3Ref = useRef<HTMLDivElement>(null);
  const [connectorGreen, setConnectorGreen] = useState<LineSeg>(EMPTY_LINE);
  const [connectorGrey, setConnectorGrey] = useState<LineSeg>(EMPTY_LINE);

  const updateConnector = useCallback(() => {
    const rail = railRef.current;
    const i1 = icon1Ref.current;
    const i2 = icon2Ref.current;
    const i3 = icon3Ref.current;
    if (!rail || !i1 || !i2 || !i3) {
      setConnectorGreen(EMPTY_LINE);
      setConnectorGrey(EMPTY_LINE);
      return;
    }
    const rr = rail.getBoundingClientRect();
    const mid = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.top + r.height / 2 - rr.top;
    };
    const y = [mid(i1), mid(i2), mid(i3)] as const;

    const statuses: TimelineStepStatus[] = [firstStepStatus, secondStepStatus, thirdStepStatus];
    const inProgressIdx = statuses.findIndex((s) => s === "in_progress");

    let splitIdx: number;
    if (inProgressIdx >= 0) {
      splitIdx = inProgressIdx;
    } else if (statuses.every((s) => s === "done")) {
      splitIdx = 2;
    } else {
      let lastDoneIdx = -1;
      for (let i = 0; i < statuses.length; i++) {
        if (statuses[i] === "done") lastDoneIdx = i;
        else break;
      }
      // No done / in-progress steps yet — keep the full rail grey (e.g. all “up next”).
      splitIdx = lastDoneIdx >= 0 ? lastDoneIdx : 0;
    }

    setConnectorGreen({ top: y[0], height: Math.max(0, y[splitIdx] - y[0]) });
    setConnectorGrey({ top: y[splitIdx], height: Math.max(0, y[2] - y[splitIdx]) });
  }, [firstStepStatus, secondStepStatus, thirdStepStatus]);

  useLayoutEffect(() => {
    updateConnector();
  }, [
    updateConnector,
    firstStepDescription,
    secondStepDescription,
    thirdStepDescription,
    firstStepStatus,
    secondStepStatus,
    thirdStepStatus,
    variant,
    surface,
    paymentSubSteps,
  ]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const ro = new ResizeObserver(() => updateConnector());
    ro.observe(rail);
    window.addEventListener("resize", updateConnector);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateConnector);
    };
  }, [updateConnector]);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(updateConnector);
    });
    return () => window.cancelAnimationFrame(id);
  }, [updateConnector]);

  const sectionClassName =
    variant === "compact"
      ? "rounded-2xl border border-[#e8e8e8] bg-white p-4"
      : "rounded-2xl border border-[#e8e8e8] bg-white px-5 py-6 shadow-[0_2px_8px_-2px_rgba(54,53,76,0.06)]";
  const rowGapClass = variant === "compact" ? "gap-y-3" : "gap-y-4";

  const timelineRail = (
    <div ref={railRef} className={`relative grid grid-cols-[24px_1fr] items-start gap-x-3 ${rowGapClass}`}>
      {connectorGreen.height > 0 ? (
        <div
          className="pointer-events-none absolute left-3 z-0 w-px -translate-x-1/2"
          style={{
            top: connectorGreen.top,
            height: connectorGreen.height,
            backgroundColor: CONNECTOR_ACTIVE,
          }}
          aria-hidden
        />
      ) : null}
      {connectorGrey.height > 0 ? (
        <div
          className="pointer-events-none absolute left-3 z-0 w-px -translate-x-1/2 bg-[#e8e8e8]"
          style={{ top: connectorGrey.top, height: connectorGrey.height }}
          aria-hidden
        />
      ) : null}
      <div ref={icon1Ref} className="relative z-[1] flex h-6 w-6 shrink-0 justify-center">
        <TimelineStepIcon status={firstStepStatus} />
      </div>
      <div className="min-w-0">
        <p className={timelineStepTitleClassName(firstStepStatus)}>{firstStepTitle}</p>
        <p className={TIMELINE_STEP_DESCRIPTION_CLASS}>{firstStepDescription}</p>
        <hr className="mt-3 border-0 border-t border-[#e8e8e8]" />
      </div>
      <div ref={icon2Ref} className="relative z-[1] flex h-6 w-6 shrink-0 justify-center">
        <TimelineStepIcon status={secondStepStatus} />
      </div>
      <div className="min-w-0">
        <p className={timelineStepTitleClassName(secondStepStatus)}>{secondStepTitle}</p>
        <p className={TIMELINE_STEP_DESCRIPTION_CLASS}>{secondStepDescription}</p>
        {paymentSubSteps && paymentSubSteps.length > 0 ? (
          <ul
            className="mt-3 space-y-3 border-l border-[#e8e8e8] pl-3"
            aria-label="Payment steps"
          >
            {paymentSubSteps.map((step, index) => (
              <li key={`${step.title}-${index}`} className="flex gap-2">
                <TimelinePaymentSubStepIcon status={step.status} />
                <div className="min-w-0">
                  <p className={timelinePaymentSubStepTitleClassName(step.status)}>{step.title}</p>
                  {step.description ? (
                    <p className="mt-0.5 text-xs font-normal leading-[18px] text-[#757575]">
                      {step.description}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
        <hr className="mt-3 border-0 border-t border-[#e8e8e8]" />
      </div>
      <div ref={icon3Ref} className="relative z-[1] flex h-6 w-6 shrink-0 justify-center">
        <TimelineStepIcon status={thirdStepStatus} />
      </div>
      <div className="min-w-0">
        <p className={timelineStepTitleClassName(thirdStepStatus)}>{thirdStepTitle}</p>
        <p className={TIMELINE_STEP_DESCRIPTION_CLASS}>{thirdStepDescription}</p>
      </div>
    </div>
  );

  if (surface === "flat") {
    return timelineRail;
  }

  return <section className={sectionClassName}>{timelineRail}</section>;
}
