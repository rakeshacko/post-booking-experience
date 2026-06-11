"use client";

import Image, { type StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronUp } from "lucide-react";

import infoIcon from "@/assets/Info.svg";

import { ConciergeTurnShell } from "@/components/concierge/ConciergeTurnShell";
import type { ConciergeReply } from "@/components/concierge/ConciergeReplies";
import { KYC_ASSETS } from "@/components/kyc/kyc-assets";
import {
  WhatsNextTimeline,
  type TimelineStepStatus,
  type WhatsNextTimelineVariant,
} from "@/components/kyc/WhatsNextTimeline";
import { WhatsNextTimelineBottomSheet } from "@/components/kyc/WhatsNextTimelineBottomSheet";
import { isDemoNavCtaLabel } from "@/lib/demo-nav-cta";

const DEFAULT_PROCESSING_HEADLINE = "We're processing your booking, Sharath!";

const DEFAULT_PROCESSING_SUBLINE =
  "We are finding the right dealer with your exact Creta variant and colour in stock.";

const DEFAULT_NEXT_HREF = "/kyc/booking-confirmed";

/** “What’s next” — car allocation when it is the upcoming step (e.g. `/kyc/processing`). */
const WHATS_NEXT_ALLOCATION_UP_NEXT =
  "Your selected variant and colour will be matched to available stock.";

/** “What’s next” — payment step description (shared with payment default timeline). */
const WHATS_NEXT_PAYMENT_SUBLINE =
  "You can choose from ACKO Drive Finance, Self Finance or Full Cash Payment.";

export type KycBookingProcessingScreenProps = {
  headline?: string;
  /** When set, shown as a second block below `headline` (word-by-word after line 1 completes). */
  headlineLine2?: string;
  subline?: string;
  /** Optional info box below `subline` (dealer OTP callout, car allocation explainer, etc.). */
  sublineLine2?: string;
  /** Optional titled info callout below `subline` (preferred when a heading is needed). */
  infoBox?: { title?: string; body: ReactNode };
  /** Info callout icon (default: Info.svg). */
  infoBoxIconSrc?: string | StaticImageData;
  /** Primary “Next” CTA destination. */
  nextHref?: string;
  /** Route to warm in the background (defaults to `nextHref`). */
  prefetchHref?: string;
  /** Passed to `WhatsNextTimeline` — use `compact` on loan processing only. */
  whatsNextTimelineVariant?: WhatsNextTimelineVariant;
  /** Car allocation row in the delivery timeline sheet (default: up next). */
  whatsNextFirstStepStatus?: TimelineStepStatus;
  whatsNextFirstStepDescription?: string;
  /** When set, replaces the default “What’s next?” timeline (e.g. loan processing stepper). */
  whatsNextCard?: ReactNode;
  /** Orange deadline copy above the primary CTA (same pattern as `/payment/default`). */
  ctaWarningLine?: string;
  /** Primary CTA label (default “Next” → renders as a demo time-skip). */
  nextCtaLabel?: string;
  /** Alternate demo branch under the time skip (e.g. the failure path). */
  altTimeSkip?: { label: string; href: string };
  /**
   * When set, primary CTA invokes this instead of navigating to `nextHref` (e.g. open a confirm sheet).
   */
  onPrimaryCtaClick?: () => void;
  /** Optional summary card rendered as an artifact below Shivi's lines. */
  heroSummaryCard?: ReactNode;
  /** Legacy hero slots — concierge turns are dialogue-first, so these are ignored. */
  heroIllustrationSlot?: ReactNode;
  belowHeadline?: ReactNode;
  heroIllustrationSrc?: string | StaticImageData;
  heroIllustrationWidth?: number;
  heroIllustrationHeight?: number;
  /** Conversation date divider — e.g. “Thu 24 Apr · morning”. */
  dayStamp?: string;
  /** Echo written when the primary reply navigates (defaults to the label). */
  replyEcho?: string | null;
  /** Contextual call affordance — essential on waiting screens, where anxiety peaks. */
  callLabel?: string;
  /**
   * Manage-booking sheet — post–car-allocation car card (engine/chassis + copy).
   * When omitted, enabled when car allocation is done or a custom `whatsNextCard` is set.
   */
  manageBookingShowVehicleIdentification?: boolean;
};

/**
 * Concierge adapter — every screen that used the old booking-processing hero
 * (finance, delivery, self-finance) renders as a Shivi turn: her lines from
 * `headline`/`subline`, artifacts from the info box and summary card, the CTA
 * as the user's reply (demo “Next” becomes a time-skip pill), and the delivery
 * timeline sheet behind a quiet footer link.
 */
export function KycBookingProcessingScreen({
  headline = DEFAULT_PROCESSING_HEADLINE,
  headlineLine2,
  subline = DEFAULT_PROCESSING_SUBLINE,
  sublineLine2,
  infoBox,
  infoBoxIconSrc = infoIcon,
  nextHref = DEFAULT_NEXT_HREF,
  prefetchHref = nextHref,
  whatsNextTimelineVariant = "default",
  whatsNextFirstStepStatus = "next",
  whatsNextFirstStepDescription = WHATS_NEXT_ALLOCATION_UP_NEXT,
  whatsNextCard,
  ctaWarningLine,
  nextCtaLabel = "Next",
  altTimeSkip,
  onPrimaryCtaClick,
  heroSummaryCard,
  belowHeadline,
  dayStamp,
  replyEcho,
  callLabel,
  manageBookingShowVehicleIdentification,
}: KycBookingProcessingScreenProps = {}) {
  const router = useRouter();
  const [whatsNextSheetOpen, setWhatsNextSheetOpen] = useState(false);

  useEffect(() => {
    router.prefetch(prefetchHref);
  }, [router, prefetchHref]);

  const showManageBookingVehicleIdentification =
    manageBookingShowVehicleIdentification ??
    (whatsNextFirstStepStatus === "done" || whatsNextCard != null);

  const says = useMemo(() => {
    const lead = headlineLine2 ? `${headline} ${headlineLine2}` : headline;
    return subline.length > 0 ? [lead, subline] : [lead];
  }, [headline, headlineLine2, subline]);

  const isDemoNav = isDemoNavCtaLabel(nextCtaLabel);

  const replies = useMemo<readonly ConciergeReply[] | undefined>(() => {
    if (isDemoNav) return undefined;
    if (onPrimaryCtaClick) {
      return [{ label: nextCtaLabel, onClick: onPrimaryCtaClick, echo: null }];
    }
    return [{ label: nextCtaLabel, href: nextHref, echo: replyEcho }];
  }, [isDemoNav, nextCtaLabel, onPrimaryCtaClick, nextHref, replyEcho]);

  const timeSkip = isDemoNav ? { label: "Skip ahead", href: nextHref } : undefined;

  const artifact = (
    <>
      {belowHeadline}
      {infoBox != null || sublineLine2 ? (
        <div className="flex items-center gap-3 rounded-2xl bg-white card-elevated px-3 py-3 text-left">
          <span className="relative h-5 w-5 shrink-0">
            <Image src={infoBoxIconSrc} alt="" fill className="object-contain" unoptimized sizes="20px" />
          </span>
          <div className="min-w-0 text-xs leading-[18px] text-[#121212]">
            {infoBox?.title ? <p className="font-medium text-[#121212]">{infoBox.title}</p> : null}
            <p className={infoBox?.title ? "mt-1 text-[#121212]" : undefined}>
              {infoBox?.body ?? sublineLine2}
            </p>
          </div>
        </div>
      ) : null}
      {heroSummaryCard}
    </>
  );

  const whatsNextSheetBody = whatsNextCard ?? (
    <WhatsNextTimeline
      variant={whatsNextTimelineVariant}
      surface="flat"
      firstStepTitle="Car allocation"
      firstStepDescription={whatsNextFirstStepDescription}
      firstStepStatus={whatsNextFirstStepStatus}
      secondStepTitle="Payment"
      secondStepDescription={WHATS_NEXT_PAYMENT_SUBLINE}
      thirdStepTitle="Car delivery"
      thirdStepDescription="Estimated delivery by 2 Mar 2026"
    />
  );

  return (
    <>
      <ConciergeTurnShell
        dayStamp={dayStamp}
        says={says}
        artifact={artifact}
        replies={replies}
        timeSkip={timeSkip}
        altTimeSkip={altTimeSkip}
        footnote={ctaWarningLine}
        callLabel={callLabel}
        manageShowVehicleIdentification={showManageBookingVehicleIdentification}
        footerExtra={
          <button
            type="button"
            className="inline-flex items-center justify-center gap-1 text-center text-sm font-medium leading-5 text-[#1B73E8] transition-colors hover:text-[#155FCC] focus-visible:rounded focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#1B73E8]/20 focus-visible:ring-offset-2"
            onClick={() => setWhatsNextSheetOpen(true)}
          >
            What&apos;s left, Shivi?
            <ChevronUp className="size-4 shrink-0" aria-hidden strokeWidth={2} />
          </button>
        }
      />
      <WhatsNextTimelineBottomSheet
        open={whatsNextSheetOpen}
        onClose={() => setWhatsNextSheetOpen(false)}
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#f5f5f5]">
            <Image
              src={KYC_ASSETS.avatarSmall}
              alt=""
              fill
              className="object-cover"
              unoptimized
              sizes="36px"
            />
          </span>
          <p className="min-w-0 text-sm leading-5 text-[#121212]">
            Here&apos;s the road to your driveway — I&apos;ll nudge you at every step.
          </p>
        </div>
        {whatsNextSheetBody}
      </WhatsNextTimelineBottomSheet>
    </>
  );
}
