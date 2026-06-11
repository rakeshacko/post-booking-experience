"use client";

import Image from "next/image";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";

import { KYC_ASSETS } from "@/components/kyc/kyc-assets";
import { WordByWordLine } from "@/components/payment/WordByWordLine";
import { instantRevealEnabled } from "@/lib/concierge/instant";
import { cn } from "@/lib/utils";

/** Word cadence — aligned with the hero headlines elsewhere (speech rhythm). */
const LEAD_WORD_DELAY_MS = 120;
const BODY_WORD_DELAY_MS = 65;
/** Beat between her lines. */
const LINE_GAP_MS = 280;
/** Longer beat after the lead when something lands between her words. */
const AFTER_LEAD_SLOT_GAP_MS = 700;

const LEAD_CLASS = "text-2xl font-medium leading-8 tracking-[-0.2px] text-[#121212]";
const BODY_CLASS = "text-base font-normal leading-6 text-[#4b4b4b]";

export type ShiviDialogueProps = {
  /** Her lines for this turn — first line is the lead (large), rest are body. */
  lines: readonly string[];
  /** Lands between the lead and the body lines once the lead is spoken (e.g. a live receipt). */
  afterLead?: ReactNode;
  /** Gate the reveal (e.g. wait for the user's echo chip to land). */
  startWhen?: boolean;
  /** Fires once after the last line has fully revealed. */
  onComplete?: () => void;
  className?: string;
};

/**
 * Shivi speaking — left-aligned dialogue block with her avatar.
 * Lines reveal word-by-word, one after another, like someone talking.
 * Reduced motion (or the instant-reveal demo flag) shows everything at once.
 */
export function ShiviDialogue({
  lines,
  afterLead,
  startWhen = true,
  onComplete,
  className,
}: ShiviDialogueProps) {
  const [skipAnimation, setSkipAnimation] = useState(false);
  const [skipResolved, setSkipResolved] = useState(false);
  /** Number of lines currently revealing/revealed. */
  const [activeLines, setActiveLines] = useState(0);
  /** Lines fully spoken — rendered static so later copy swaps don't re-animate. */
  const [doneLines, setDoneLines] = useState(0);
  const [leadDone, setLeadDone] = useState(false);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setSkipAnimation(mq.matches || instantRevealEnabled());
    apply();
    setSkipResolved(true);
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!startWhen || !skipResolved) return;
    if (skipAnimation) {
      setActiveLines(lines.length);
      if (!completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current?.();
      }
      return;
    }
    setActiveLines((count) => (count === 0 ? 1 : count));
  }, [startWhen, skipResolved, skipAnimation, lines.length]);

  const onLineComplete = (index: number) => {
    if (index === 0) setLeadDone(true);
    setDoneLines((count) => Math.max(count, index + 1));
    if (index < lines.length - 1) {
      const gap = index === 0 && afterLead ? AFTER_LEAD_SLOT_GAP_MS : LINE_GAP_MS;
      window.setTimeout(() => {
        setActiveLines((count) => Math.max(count, index + 2));
      }, gap);
      return;
    }
    if (!completedRef.current) {
      completedRef.current = true;
      onCompleteRef.current?.();
    }
  };

  const slotVisible = afterLead != null && (leadDone || (skipAnimation && activeLines > 0));

  return (
    <div className={cn("flex flex-col", className)}>
      <div
        className={cn(
          "flex items-center gap-2 transition-opacity duration-300",
          startWhen ? "opacity-100" : "opacity-0"
        )}
      >
        <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#f5f5f5]">
          <Image
            src={KYC_ASSETS.avatarSmall}
            alt=""
            fill
            className="object-cover"
            unoptimized
            sizes="32px"
            priority
          />
        </span>
        <span className="text-sm font-medium leading-5 text-[#121212]">Shivi</span>
        <span className="text-xs leading-4 text-[#8f8e92]">ACKO Drive</span>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {lines.map((line, idx) => {
          if (idx >= activeLines) return null;
          const lineNode =
            skipAnimation || idx < doneLines ? (
              idx === 0 ? (
                <h1 className={LEAD_CLASS}>{line}</h1>
              ) : (
                <p className={BODY_CLASS}>{line}</p>
              )
            ) : (
              <WordByWordLine
                text={line}
                as={idx === 0 ? "h1" : "p"}
                wordDelayMs={idx === 0 ? LEAD_WORD_DELAY_MS : BODY_WORD_DELAY_MS}
                onComplete={() => onLineComplete(idx)}
                ariaLabel={line}
                className={idx === 0 ? LEAD_CLASS : BODY_CLASS}
              />
            );
          return (
            <Fragment key={idx}>
              {lineNode}
              {idx === 0 && slotVisible ? (
                <div className="kyc-stagger my-2">{afterLead}</div>
              ) : null}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
