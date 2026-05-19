"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronUp } from "lucide-react";

import menuIcon from "@/assets/menu.svg";

import { GetHelpPillButton } from "@/components/kyc/GetHelpPillButton";
import {
  WhatsNextTimeline,
  type WhatsNextTimelineVariant,
} from "@/components/kyc/WhatsNextTimeline";
import { WhatsNextTimelineBottomSheet } from "@/components/kyc/WhatsNextTimelineBottomSheet";
import { KYC_ASSETS } from "@/components/kyc/kyc-assets";
import { ManageBookingBottomSheet } from "@/components/kyc/ManageBookingBottomSheet";
import { KycTopNavHeader } from "@/components/kyc/KycTopNavHeader";
import { WordByWordLine } from "@/components/payment/WordByWordLine";
import { AuroraLightLayer } from "@/components/ui/aurora-light-layer";

const DEFAULT_PROCESSING_HEADLINE = "We're processing your booking, Sharath!";

const DEFAULT_PROCESSING_SUBLINE = "We will send you an OTP to confirm.";

const DEFAULT_NEXT_HREF = "/kyc/booking-confirmed";

/** Word cadence for the hero headline (aligned with KYC pending). */
const HEADLINE_WORD_DELAY_MS = 135;
const HERO_FADE_DURATION_CLASS = "duration-[450ms]";
const SUBLINE_TO_CTA_DELAY_MS = 240;
/** Delay after CTA is shown before the orange deadline line (aligned with `PaymentDefaultScreen`). */
const CTA_TO_WARNING_DELAY_MS = 480;

const HERO_MIN_HEIGHT = "min-h-[90dvh]";
/** Matches `KycPendingScreen` — vertical rhythm under the nav bar (24px tighter than legacy 96px). */
const HERO_ICON_TOP_PT = "pt-[72px]";

/** “What’s next” — car allocation step (shared with payment default timeline). */
const WHATS_NEXT_ALLOCATION_SUBLINE =
  "Your selected variant and colour are being matched to available stock.";

/** “What’s next” — payment step description (shared with payment default timeline). */
const WHATS_NEXT_PAYMENT_SUBLINE =
  "You can choose from ACKO Drive Finance, Self Finance or Full Cash Payment.";

function MenuOptionsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="More options"
      onClick={onClick}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#121212] transition-colors hover:bg-[#fafafa] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/20 focus-visible:ring-offset-2"
    >
      <span className="relative h-6 w-6" aria-hidden>
        <Image src={menuIcon} alt="" fill className="object-contain" unoptimized sizes="24px" />
      </span>
    </button>
  );
}

export type KycBookingProcessingScreenProps = {
  headline?: string;
  /** When set, shown as a second block below `headline` (word-by-word after line 1 completes). */
  headlineLine2?: string;
  subline?: string;
  /** Primary “Next” CTA destination. */
  nextHref?: string;
  /** Route to warm in the background (defaults to `nextHref`). */
  prefetchHref?: string;
  /** Passed to `WhatsNextTimeline` — use `compact` on loan processing only. */
  whatsNextTimelineVariant?: WhatsNextTimelineVariant;
  /** When set, replaces the default “What’s next?” timeline (e.g. loan processing stepper). */
  whatsNextCard?: ReactNode;
  /** Orange deadline copy above the primary CTA (same pattern as `/payment/default`). */
  ctaWarningLine?: string;
  /** Primary CTA label (default “Next”). */
  nextCtaLabel?: string;
  /**
   * When set, primary CTA invokes this instead of navigating to `nextHref` (e.g. open a confirm sheet).
   */
  onPrimaryCtaClick?: () => void;
  /** Optional summary card rendered inside the hero, directly below the subline. */
  heroSummaryCard?: ReactNode;
  /** Hero illustration (default: booking-processing art). */
  heroIllustrationSrc?: string;
};

/**
 * Booking processing — hero aligned with `KycPendingScreen` (nav + aurora + staggered copy + primary CTA).
 * “See your delivery timeline” opens a bottom sheet with `WhatsNextTimeline` or custom `whatsNextCard`; manage booking uses the sheet from the nav menu.
 */
export function KycBookingProcessingScreen({
  headline = DEFAULT_PROCESSING_HEADLINE,
  headlineLine2,
  subline = DEFAULT_PROCESSING_SUBLINE,
  nextHref = DEFAULT_NEXT_HREF,
  prefetchHref = nextHref,
  whatsNextTimelineVariant = "default",
  whatsNextCard,
  ctaWarningLine,
  nextCtaLabel = "Next",
  onPrimaryCtaClick,
  heroSummaryCard,
  heroIllustrationSrc = KYC_ASSETS.bookingProcessingHero,
}: KycBookingProcessingScreenProps = {}) {
  const router = useRouter();
  const [reduceMotion, setReduceMotion] = useState(false);
  /** Second headline line animation starts after first line finishes (only when `headlineLine2` is set). */
  const [headlineLineOneDone, setHeadlineLineOneDone] = useState(false);
  /** Word animation gated on hero art loading — same sequencing as `/kyc`. */
  const [heroArtReady, setHeroArtReady] = useState(false);
  const [showSubline, setShowSubline] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [manageBookingOpen, setManageBookingOpen] = useState(false);
  const [whatsNextSheetOpen, setWhatsNextSheetOpen] = useState(false);

  const onHeadlineComplete = useCallback(() => {
    setShowSubline(true);
    window.setTimeout(() => setShowCta(true), SUBLINE_TO_CTA_DELAY_MS);
    if (ctaWarningLine) {
      window.setTimeout(
        () => setShowWarning(true),
        SUBLINE_TO_CTA_DELAY_MS + CTA_TO_WARNING_DELAY_MS,
      );
    }
  }, [ctaWarningLine]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    if (mq.matches) {
      setHeroArtReady(true);
      setShowSubline(true);
      setShowCta(true);
      if (ctaWarningLine) {
        setShowWarning(true);
      }
    }
  }, [ctaWarningLine]);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setTimeout(() => {
      setHeroArtReady((ready) => (ready ? ready : true));
    }, 2800);
    return () => window.clearTimeout(id);
  }, [reduceMotion]);

  useEffect(() => {
    setHeadlineLineOneDone(false);
  }, [headline, headlineLine2]);

  const headlineAriaLabel = useMemo(
    () => (headlineLine2 ? `${headline} ${headlineLine2}` : headline),
    [headline, headlineLine2],
  );

  useEffect(() => {
    router.prefetch(prefetchHref);
  }, [router, prefetchHref]);

  const whatsNextSheetBody = useMemo(
    () =>
      whatsNextCard ?? (
        <WhatsNextTimeline
          variant={whatsNextTimelineVariant}
          surface="flat"
          firstStepTitle="Car allocation"
          firstStepDescription={WHATS_NEXT_ALLOCATION_SUBLINE}
          secondStepTitle="Payment"
          secondStepDescription={WHATS_NEXT_PAYMENT_SUBLINE}
          thirdStepTitle="Car delivery"
          thirdStepDescription="Estimated delivery by 2 Mar 2026"
        />
      ),
    [whatsNextCard, whatsNextTimelineVariant],
  );

  const ctaRevealClass =
    showCta
      ? "opacity-100"
      : "pointer-events-none opacity-0";

  return (
    <div className="flex min-h-dvh flex-col bg-white font-sans">
      <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col">
        <div
          className={`kyc-pending-hero-card relative isolate mx-auto flex min-h-0 w-full flex-1 flex-col ${HERO_MIN_HEIGHT}`}
        >
          <KycTopNavHeader
            transparent
            endSlot={
              <div className="flex shrink-0 items-center gap-2">
                <GetHelpPillButton />
                <MenuOptionsButton onClick={() => setManageBookingOpen(true)} />
              </div>
            }
          />
          <AuroraLightLayer />
          <div
            className={`relative z-10 flex min-h-0 w-full flex-1 flex-col items-center px-5 pb-[max(32px,env(safe-area-inset-bottom,0px))] ${HERO_ICON_TOP_PT}`}
          >
            {/* Illustration sizing matches `KycPendingScreen` (80 × 80, `h-20 w-20`). */}
            <div className="relative h-20 w-20 shrink-0">
              <Image
                src={heroIllustrationSrc}
                alt=""
                width={80}
                height={80}
                className="h-20 w-20 object-contain"
                unoptimized
                priority
                onLoadingComplete={() => setHeroArtReady(true)}
              />
            </div>

            <div className="mt-8 flex w-full flex-col gap-4 text-center">
              {reduceMotion ? (
                <h1 className="text-2xl font-semibold leading-8 tracking-tight text-[#121212]">
                  {headlineLine2 ? (
                    <>
                      <span className="block">{headline}</span>
                      <span className="block">{headlineLine2}</span>
                    </>
                  ) : (
                    headline
                  )}
                </h1>
              ) : headlineLine2 ? (
                <h1
                  className="text-2xl font-semibold leading-8 tracking-tight text-[#121212]"
                  aria-label={headlineAriaLabel}
                >
                  <span className="block">
                    <WordByWordLine
                      as="span"
                      text={headline}
                      wordDelayMs={HEADLINE_WORD_DELAY_MS}
                      wordOpacityDurationClassName={HERO_FADE_DURATION_CLASS}
                      className="text-2xl font-semibold leading-8 tracking-tight text-[#121212]"
                      onComplete={() => setHeadlineLineOneDone(true)}
                      startWhen={heroArtReady}
                    />
                  </span>
                  <span className="block">
                    <WordByWordLine
                      as="span"
                      text={headlineLine2}
                      wordDelayMs={HEADLINE_WORD_DELAY_MS}
                      wordOpacityDurationClassName={HERO_FADE_DURATION_CLASS}
                      className="text-2xl font-semibold leading-8 tracking-tight text-[#121212]"
                      onComplete={onHeadlineComplete}
                      startWhen={headlineLineOneDone}
                    />
                  </span>
                </h1>
              ) : (
                <WordByWordLine
                  as="h1"
                  ariaLabel={headline}
                  text={headline}
                  wordDelayMs={HEADLINE_WORD_DELAY_MS}
                  wordOpacityDurationClassName={HERO_FADE_DURATION_CLASS}
                  className="text-2xl font-semibold leading-8 tracking-tight text-[#121212]"
                  onComplete={onHeadlineComplete}
                  startWhen={heroArtReady}
                />
              )}
              <p
                className={`text-sm font-normal leading-[20px] text-[#4b4b4b] transition-opacity ${HERO_FADE_DURATION_CLASS} ease-out ${
                  showSubline ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden={!showSubline}
              >
                {subline}
              </p>
            </div>

            {heroSummaryCard ? (
              <div
                className={`mt-[20px] w-full transition-opacity ${HERO_FADE_DURATION_CLASS} ease-out ${
                  showSubline ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden={!showSubline}
              >
                {heroSummaryCard}
              </div>
            ) : null}

            <div className="mt-auto flex w-full flex-col items-center pt-8">
              {ctaWarningLine ? (
                <p
                  className={`text-center text-xs font-medium leading-[18px] text-[#d16900] transition-opacity ${HERO_FADE_DURATION_CLASS} ease-out ${
                    showWarning ? "opacity-100" : "opacity-0"
                  }`}
                  aria-hidden={!showWarning}
                >
                  {ctaWarningLine}
                </p>
              ) : null}
              <button
                type="button"
                className={`primary-cta w-full transition-opacity ${HERO_FADE_DURATION_CLASS} ease-out focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/30 focus-visible:ring-offset-2 ${
                  ctaWarningLine ? "mt-4 " : ""
                }${ctaRevealClass}`}
                tabIndex={showCta ? 0 : -1}
                onClick={() =>
                  onPrimaryCtaClick ? onPrimaryCtaClick() : router.push(nextHref)
                }
              >
                {nextCtaLabel}
              </button>
              <div className="mt-6 flex w-full justify-center">
                <button
                  type="button"
                  className={`inline-flex items-center justify-center gap-1 text-center text-sm font-medium leading-5 text-[#1B73E8] transition-[color,opacity] hover:text-[#155FCC] ${HERO_FADE_DURATION_CLASS} ease-out focus-visible:rounded focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#1B73E8]/20 focus-visible:ring-offset-2 ${ctaRevealClass}`}
                  tabIndex={showCta ? 0 : -1}
                  onClick={() => setWhatsNextSheetOpen(true)}
                >
                  See your delivery timeline
                  <ChevronUp className="size-4 shrink-0" aria-hidden strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ManageBookingBottomSheet open={manageBookingOpen} onClose={() => setManageBookingOpen(false)} />
      <WhatsNextTimelineBottomSheet
        open={whatsNextSheetOpen}
        onClose={() => setWhatsNextSheetOpen(false)}
      >
        {whatsNextSheetBody}
      </WhatsNextTimelineBottomSheet>
    </div>
  );
}
