"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import menuIcon from "@/assets/menu.svg";
import { GetHelpPillButton } from "@/components/kyc/GetHelpPillButton";
import { KYC_ASSETS } from "@/components/kyc/kyc-assets";
import { KycTopNavHeader } from "@/components/kyc/KycTopNavHeader";
import { WordByWordLine } from "@/components/payment/WordByWordLine";
import { AuroraLightLayer } from "@/components/ui/aurora-light-layer";
import { ManageBookingBottomSheet } from "@/components/kyc/ManageBookingBottomSheet";

const KYC_HEADLINE =
  "Sharath, the car is almost yours! Identify yourself to process your booking.";

const KYC_SUBLINE =
  "Complete KYC now to get your Creta by 10 Jun. Subject to inventory availability.";

const DEADLINE_LINE = "Complete by 24 Apr, 3:00 PM to avoid cancellation";

/** Word cadence for the hero headline. */
const HEADLINE_WORD_DELAY_MS = 135;
/** Shared opacity transition duration (headline words + subline + CTA + warning). */
const HERO_FADE_DURATION_CLASS = "duration-[450ms]";
/** Delay after subline appears before the CTA fades in. */
const SUBLINE_TO_CTA_DELAY_MS = 240;
/** Delay after CTA is shown before the warning line appears. */
const CTA_TO_WARNING_DELAY_MS = 480;

/** Hero block (header + aurora + content) fills at least 90% of the viewport; uses `dvh` for mobile browser chrome. */
const HERO_MIN_HEIGHT = "min-h-[90dvh]";

/** Vertical offset from nav bottom to KYC icon top — Figma 2179:8512 (≈96px below 56px bars). */
const HERO_ICON_TOP_PT = "pt-[96px]";

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

/**
 * KYC verification (pending) — [Figma 2179:8512](https://www.figma.com/design/nW5SWmJdxxsCEDlqBN7C0L/Post-booking-experience?node-id=2179-8512).
 */
export function KycPendingScreen() {
  const router = useRouter();
  const [reduceMotion, setReduceMotion] = useState(false);
  /** Headline word animation starts only after the KYC hero art has loaded (order: header → illustration → action copy). */
  const [heroArtReady, setHeroArtReady] = useState(false);
  const [showSubline, setShowSubline] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [manageBookingOpen, setManageBookingOpen] = useState(false);

  const onHeadlineComplete = useCallback(() => {
    setShowSubline(true);
    window.setTimeout(() => setShowCta(true), SUBLINE_TO_CTA_DELAY_MS);
    window.setTimeout(
      () => setShowWarning(true),
      SUBLINE_TO_CTA_DELAY_MS + CTA_TO_WARNING_DELAY_MS,
    );
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    if (mq.matches) {
      setHeroArtReady(true);
      setShowSubline(true);
      setShowCta(true);
      setShowWarning(true);
    }
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setTimeout(() => {
      setHeroArtReady((ready) => (ready ? ready : true));
    }, 2800);
    return () => window.clearTimeout(id);
  }, [reduceMotion]);

  return (
    <div className="flex min-h-dvh flex-col bg-white font-sans">
      <div className="mx-auto flex w-full max-w-[360px] flex-1 flex-col">
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
          <div className={`relative z-10 flex min-h-0 w-full flex-1 flex-col items-center px-5 pb-10 ${HERO_ICON_TOP_PT}`}>
            <div className="relative h-20 w-20 shrink-0">
              <Image
                src={KYC_ASSETS.kycHero}
                alt=""
                width={80}
                height={80}
                className="h-20 w-20"
                priority
                unoptimized
                onLoadingComplete={() => setHeroArtReady(true)}
              />
            </div>

            <div className="mt-8 flex w-full flex-col gap-4 text-center">
              {reduceMotion ? (
                <h1 className="text-2xl font-semibold leading-8 tracking-tight text-[#121212]">
                  {KYC_HEADLINE}
                </h1>
              ) : (
                <WordByWordLine
                  as="h1"
                  ariaLabel={KYC_HEADLINE}
                  text={KYC_HEADLINE}
                  wordDelayMs={HEADLINE_WORD_DELAY_MS}
                  wordOpacityDurationClassName={HERO_FADE_DURATION_CLASS}
                  className="text-2xl font-semibold leading-8 tracking-tight text-[#121212]"
                  onComplete={onHeadlineComplete}
                  startWhen={heroArtReady}
                />
              )}
              <p
                className={`text-sm font-normal leading-[22px] text-[#4b4b4b] transition-opacity ${HERO_FADE_DURATION_CLASS} ease-out ${
                  showSubline ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden={!showSubline}
              >
                {KYC_SUBLINE}
              </p>
            </div>

            <div className="mt-auto w-full pt-8">
              <p
                className={`text-center text-xs font-medium leading-[18px] text-[#d16900] transition-opacity ${HERO_FADE_DURATION_CLASS} ease-out ${
                  showWarning ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden={!showWarning}
              >
                {DEADLINE_LINE}
              </p>
              <button
                type="button"
                className={`primary-cta mt-4 transition-opacity ${HERO_FADE_DURATION_CLASS} ease-out focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/30 focus-visible:ring-offset-2 ${
                  showCta ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
                tabIndex={showCta ? 0 : -1}
                onClick={() => router.push("/kyc/upload")}
              >
                Complete KYC Now
              </button>
            </div>
          </div>
        </div>
      </div>
      <ManageBookingBottomSheet open={manageBookingOpen} onClose={() => setManageBookingOpen(false)} />
    </div>
  );
}
