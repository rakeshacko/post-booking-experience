"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { ConciergeReplies, type ConciergeReply } from "@/components/concierge/ConciergeReplies";
import {
  ManageBookingZoomOverlay,
  ZOOM_OVERLAY_MS,
} from "@/components/concierge/ManageBookingZoomOverlay";
import { ShiviCallSheet } from "@/components/concierge/ShiviCallSheet";
import { ShiviDialogue } from "@/components/concierge/ShiviDialogue";
import { TimeSkipChip } from "@/components/concierge/TimeSkipChip";
import { UserEchoChip } from "@/components/concierge/UserEchoChip";
import {
  WorkingNarration,
  type WorkingNarrationMode,
} from "@/components/concierge/WorkingNarration";
import { KycTopNavHeader } from "@/components/kyc/KycTopNavHeader";
import { AuroraLightLayer } from "@/components/ui/aurora-light-layer";
import { ShimmerInfoCard } from "@/components/ui/ShimmerInfoCard";
import { consumeConciergeEcho } from "@/lib/concierge/echo";
import { instantRevealEnabled } from "@/lib/concierge/instant";
import { readExperienceFlow } from "@/lib/experience-flow";
import { getDeliveryDateShort } from "@/lib/journey-stage";
import { cn } from "@/lib/utils";

/** Pause after the echo chip lands before Shivi starts talking. */
const ECHO_TO_DIALOGUE_MS = 550;
/** Pause after dialogue before the artifact / working feed appears. */
const DIALOGUE_TO_CONTENT_MS = 220;

export type ConciergeTurn = {
  /** Conversation date divider — e.g. “Day 2 · Tuesday”. */
  dayStamp?: string;
  /** Shivi's lines, in speaking order. */
  says: readonly string[];
  /** Lands between her lead line and the rest — the live event she's narrating (e.g. a payment settling). */
  afterLead?: ReactNode;
  /** What she hands you — card(s) below her words. */
  artifact?: ReactNode;
  /** Her visible activity for working turns. */
  working?: {
    lines: readonly string[];
    /** `ongoing` for real-world waits that must not pretend to finish in-session. */
    mode?: WorkingNarrationMode;
    doneLabel?: string;
    etaLabel?: string;
    /** Ongoing mode — lines before this index render done. */
    doneCount?: number;
  };
  /** Your reply affordances (fixed footer). */
  replies?: readonly ConciergeReply[];
  /** Demo time travel to the next turn (fixed footer, below replies). */
  timeSkip?: { label: string; href: string; onBeforeNavigate?: () => void };
  /** Alternate demo branch (e.g. the failure path) — second pill under the time skip. */
  altTimeSkip?: { label: string; href: string };
  /** Orange commitment line above the footer (deadlines, expectations). */
  footnote?: string;
  /** Render the footnote inline after the turn's content instead of fixed above the CTA. */
  footnoteInline?: boolean;
  /**
   * Who the delivery date is waiting on this turn — drives the date pill's dot.
   * Defaults to `you` when the turn has replies (user action), else `shivi`.
   */
  dateHolder?: "you" | "shivi";
  /** Contextual “talk to her” affordance — quiet button under the replies. */
  callLabel?: string;
  /** Extra quiet control under the replies (e.g. delivery-timeline sheet trigger). */
  footerExtra?: ReactNode;
};

export type ConciergeTurnShellProps = ConciergeTurn & {
  /** Fires once when the post-dialogue content reveals — e.g. to settle a live lead card. */
  onContentShown?: () => void;
  /** Hide the back chevron on moments that shouldn't rewind (e.g. arrival). */
  hideBack?: boolean;
  /** Nav menu opening the manage sheet (change selection / cancel entry points). */
  showMenu?: boolean;
  /** Manage sheet — show engine/chassis rows post-allocation. */
  manageShowVehicleIdentification?: boolean;
  children?: ReactNode;
};

/**
 * Recede transition shared by the page layers when the manage overlay is up.
 * Note: Tailwind v4 `scale-*` sets the individual `scale` property (not
 * `transform`), so `scale` must be named in the transition list explicitly.
 */
const RECEDE_TRANSITION =
  "transition-[scale,filter,opacity] duration-[650ms] ease-in-out motion-reduce:transition-none";
/**
 * Layer-promotion hint, applied ONLY while the manage layer is up. Left on
 * permanently, `will-change: filter` keeps the whole page in a rasterized
 * composited layer — iOS Safari quantizes the subtle card shadows there.
 */
const RECEDE_WILL_CHANGE = "will-change-[scale,filter,opacity]";
const RECEDE_ACTIVE = "pointer-events-none scale-[0.88] opacity-0 blur-[8px]";

/**
 * Presentation state for the manage layer. The overlay mounts first (its
 * layout and image decode happen while everything is still), then one frame
 * later both layers start animating on the same clock — mounting and
 * animating in the same frame is what made the transition stutter.
 */
function useManageLayer() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Two frames so the overlay's first paint lands before the animation
      // starts; the timeout covers hidden/throttled tabs where rAF stalls.
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setShown(true));
      });
      const fallback = setTimeout(() => setShown(true), 80);
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
        clearTimeout(fallback);
      };
    }
    setShown(false);
    // Unmount only after the exit transition truly finishes — removing the
    // element while opacity still has a tail reads as a pop.
    const timeout = setTimeout(() => setMounted(false), ZOOM_OVERLAY_MS + 150);
    return () => clearTimeout(timeout);
  }, [open]);

  return { open, setOpen, mounted, shown };
}

/**
 * The living delivery date — always visible, always honest about who holds it:
 * amber dot when the turn waits on the user, green when Shivi's working.
 * Tap opens the purchase-state layer where the full story lives.
 */
function DeliveryDatePill({
  holder,
  onClick,
}: {
  holder: "you" | "shivi";
  onClick: () => void;
}) {
  const [date, setDate] = useState<string | null>(null);

  useEffect(() => {
    setDate(getDeliveryDateShort(readExperienceFlow()));
  }, []);

  if (!date) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Car arrives ${date} — ${
        holder === "you" ? "waiting on you" : "on track"
      }. View purchase status.`}
      className="concierge-echo-in pointer-events-auto flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-[#e8e8e8] bg-white pl-2.5 pr-3 text-xs leading-4 text-[#121212] transition-[background-color,scale] hover:bg-[#fafafa] active:scale-[0.96]"
    >
      <span aria-hidden className="relative flex h-1.5 w-1.5 shrink-0">
        {holder === "you" ? (
          <span
            className="absolute inset-0 animate-ping rounded-full bg-[#d99a23]/60 [animation-duration:2.4s] motion-reduce:hidden"
            aria-hidden
          />
        ) : null}
        <span
          className={cn(
            "relative h-1.5 w-1.5 rounded-full",
            holder === "you" ? "bg-[#d99a23]" : "bg-[#0fa457]"
          )}
        />
      </span>
      <span className="text-[#757575]">Arrives</span>
      <span className="-ml-0.5 font-semibold">{date}</span>
    </button>
  );
}

/**
 * Expand/contract control — opens the manage layer (Dot-style zoom) and
 * morphs into a close affordance while the layer is up.
 */
function ExpandContractButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={open ? "Close booking details" : "Manage booking"}
      aria-expanded={open}
      onClick={onClick}
      className="pointer-events-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#121212] transition-colors hover:bg-[#fafafa] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/20 focus-visible:ring-offset-2"
    >
      <span className="relative h-4 w-4" aria-hidden>
        {/* Expand — diagonal out arrows */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "absolute inset-0 h-4 w-4 transition-[rotate,scale,opacity] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            open ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"
          )}
        >
          <path d="M14 4.5h5.5V10" />
          <path d="M19.5 4.5 13 11" />
          <path d="M10 19.5H4.5V14" />
          <path d="M4.5 19.5 11 13" />
        </svg>
        {/* Contract — close */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "absolute inset-0 h-4 w-4 transition-[rotate,scale,opacity] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            open ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"
          )}
        >
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
        </svg>
      </span>
    </button>
  );
}

/**
 * One turn of the concierge conversation — the page grammar:
 * your last words land (echo) → Shivi speaks → she hands you something
 * (artifact) or visibly works → you reply / time passes.
 */
export function ConciergeTurnShell({
  dayStamp,
  says,
  afterLead,
  artifact,
  working,
  replies,
  timeSkip,
  altTimeSkip,
  footnote,
  footnoteInline = false,
  dateHolder,
  callLabel,
  footerExtra,
  onContentShown,
  hideBack = false,
  showMenu = true,
  manageShowVehicleIdentification,
  children,
}: ConciergeTurnShellProps) {
  const [echo, setEcho] = useState<string | null>(null);
  const manage = useManageLayer();
  const [callSheetOpen, setCallSheetOpen] = useState(false);
  const [dialogueStarted, setDialogueStarted] = useState(false);
  const [dialogueDone, setDialogueDone] = useState(false);
  const [contentShown, setContentShown] = useState(false);
  const [ready, setReady] = useState(false);

  /** Consume the echo once on mount, then begin the turn. */
  useEffect(() => {
    const pending = consumeConciergeEcho();
    setEcho(pending);
    if (pending == null || instantRevealEnabled()) {
      setDialogueStarted(true);
      return;
    }
    const id = window.setTimeout(() => setDialogueStarted(true), ECHO_TO_DIALOGUE_MS);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!dialogueDone) return;
    if (instantRevealEnabled()) {
      setContentShown(true);
      return;
    }
    const id = window.setTimeout(() => setContentShown(true), DIALOGUE_TO_CONTENT_MS);
    return () => window.clearTimeout(id);
  }, [dialogueDone]);

  /** Footer becomes available when the turn has nothing left to reveal. */
  useEffect(() => {
    if (!contentShown) return;
    if (working) return; // WorkingNarration flips `ready` via onAllDone
    setReady(true);
  }, [contentShown, working]);

  const onContentShownRef = useRef(onContentShown);
  onContentShownRef.current = onContentShown;
  useEffect(() => {
    if (!contentShown) return;
    onContentShownRef.current?.();
  }, [contentShown]);

  const hasFooter = Boolean(replies?.length || timeSkip || footnote || callLabel || footerExtra);

  return (
    <div className="relative min-h-dvh overflow-x-clip bg-[#f1f0f5]">
      <AuroraLightLayer />

      {/* Floats above both layers; morphs expand → close while the manage layer is up. */}
      {showMenu ? (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[110]">
          <div className="mx-auto flex h-14 w-full max-w-[640px] items-center justify-end gap-2 pr-5">
            <DeliveryDatePill
              holder={dateHolder ?? (replies?.length ? "you" : "shivi")}
              onClick={() => manage.setOpen(true)}
            />
            <ExpandContractButton open={manage.open} onClick={() => manage.setOpen((v) => !v)} />
          </div>
        </div>
      ) : null}

      {/* Page layer — recedes into depth while the manage layer is up. */}
      <div
        className={cn(
          RECEDE_TRANSITION,
          manage.mounted && RECEDE_WILL_CHANGE,
          manage.shown && RECEDE_ACTIVE
        )}
        aria-hidden={manage.open || undefined}
        inert={manage.open || undefined}
      >
      <KycTopNavHeader
        transparent
        className={hideBack ? "[&>div:first-of-type>button]:invisible" : undefined}
      />

      <main
        className={cn(
          "relative z-10 mx-auto flex w-full max-w-[640px] flex-col px-5 pt-3",
          hasFooter ? "pb-56" : "pb-16"
        )}
      >
        {dayStamp ? (
          <div className="mb-5 flex items-center gap-3" aria-hidden>
            <span className="h-px flex-1 bg-[#ececec]" />
            <span className="text-[11px] font-medium uppercase leading-4 tracking-[0.08em] text-[#8f8e92]">
              {dayStamp}
            </span>
            <span className="h-px flex-1 bg-[#ececec]" />
          </div>
        ) : null}

        {echo ? <UserEchoChip text={echo} className="mb-6" /> : null}

        <ShiviDialogue
          lines={says}
          afterLead={afterLead}
          startWhen={dialogueStarted}
          onComplete={() => setDialogueDone(true)}
        />

        {contentShown && (artifact || children) ? (
          <div className="kyc-stagger mt-7 flex flex-col gap-4">
            {artifact}
            {children}
          </div>
        ) : null}

        {working ? (
          <WorkingNarration
            lines={working.lines}
            mode={working.mode}
            doneLabel={working.doneLabel}
            etaLabel={working.etaLabel}
            ongoingDoneCount={working.doneCount}
            startWhen={contentShown}
            onAllDone={() => setReady(true)}
            className="mt-7"
          />
        ) : null}

        {footnote && footnoteInline && ready ? (
          <div className="kyc-stagger mt-4">
            <ShimmerInfoCard icon="clock">{footnote}</ShimmerInfoCard>
          </div>
        ) : null}
      </main>
      </div>

      {hasFooter ? (
        <div
          className={cn(
            "fixed inset-x-0 bottom-0 z-20 origin-bottom",
            RECEDE_TRANSITION,
            manage.mounted && RECEDE_WILL_CHANGE,
            ready ? "opacity-100" : "pointer-events-none opacity-0",
            manage.shown && RECEDE_ACTIVE
          )}
        >
          <div className="mx-auto w-full max-w-[640px] bg-[linear-gradient(to_top,#f1f0f5_55%,rgba(241,240,245,0))] px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-12">
            {footnote && !footnoteInline ? (
              <div className="mb-3">
                <ShimmerInfoCard icon="clock">{footnote}</ShimmerInfoCard>
              </div>
            ) : null}
            {replies?.length ? <ConciergeReplies replies={replies} /> : null}
            {callLabel ? (
              <button
                type="button"
                onClick={() => setCallSheetOpen(true)}
                className={cn(
                  "mx-auto flex h-9 items-center justify-center gap-1.5 px-3 text-sm font-medium text-[#4b4b4b] underline decoration-[#c2c2c2] underline-offset-4 transition-colors hover:text-[#121212]",
                  replies?.length ? "mt-2" : undefined
                )}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {callLabel}
              </button>
            ) : null}
            {footerExtra ? (
              <div className={cn("flex w-full justify-center", replies?.length || callLabel ? "mt-2" : undefined)}>
                {footerExtra}
              </div>
            ) : null}
            {timeSkip ? (
              <TimeSkipChip
                label={timeSkip.label}
                href={timeSkip.href}
                onBeforeNavigate={timeSkip.onBeforeNavigate}
                className={replies?.length || callLabel ? "mt-4" : undefined}
              />
            ) : null}
            {altTimeSkip ? (
              <TimeSkipChip label={altTimeSkip.label} href={altTimeSkip.href} className="mt-2" />
            ) : null}
          </div>
        </div>
      ) : null}

      {showMenu ? (
        <ManageBookingZoomOverlay
          mounted={manage.mounted}
          shown={manage.shown}
          onClose={() => manage.setOpen(false)}
          showVehicleIdentification={manageShowVehicleIdentification}
          dateHolder={dateHolder ?? (replies?.length ? "you" : "shivi")}
        />
      ) : null}
      {callLabel ? (
        <ShiviCallSheet open={callSheetOpen} onClose={() => setCallSheetOpen(false)} />
      ) : null}
    </div>
  );
}
