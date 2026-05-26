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
import {
  HERO_ACTION_HEADLINE_SUBLINE_GAP_CLASS,
  HERO_ICON_TOP_PT,
  HERO_ILLUSTRATION_TO_COPY_MT,
} from "@/components/ui/success-screen-layout";
import { ManageBookingBottomSheet } from "@/components/kyc/ManageBookingBottomSheet";

const HEADLINE = "KYC verification in progress";

const SUBLINE =
  "We're verifying your identity. This usually takes a short while.";

/** Word cadence for the hero headline. */
const HEADLINE_WORD_DELAY_MS = 135;
/** Shared opacity transition duration (headline words + subline + CTA). */
const HERO_FADE_DURATION_CLASS = "duration-[450ms]";
/** Delay after subline appears before the CTA fades in. */
const SUBLINE_TO_CTA_DELAY_MS = 240;
/** Hero block (header + aurora + content) fills at least 90% of the viewport; uses `dvh` for mobile browser chrome. */
const HERO_MIN_HEIGHT = "min-h-[90dvh]";

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

type KycVerificationInProgressScreenProps = {
  /** Primary CTA destination (defaults to booking processing). */
  nextHref?: string;
};

/**
 * KYC verification in progress — action-page layout aligned with `KycPendingScreen`.
 */
export function KycVerificationInProgressScreen({
  nextHref = "/kyc/processing",
}: KycVerificationInProgressScreenProps) {
  const router = useRouter();
  const [reduceMotion, setReduceMotion] = useState(false);
  /** Headline word animation starts only after the KYC hero art has loaded (order: header → illustration → action copy). */
  const [heroArtReady, setHeroArtReady] = useState(false);
  const [showSubline, setShowSubline] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const [manageBookingOpen, setManageBookingOpen] = useState(false);

  const onHeadlineComplete = useCallback(() => {
    setShowSubline(true);
    window.setTimeout(() => setShowCta(true), SUBLINE_TO_CTA_DELAY_MS);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    if (mq.matches) {
      setHeroArtReady(true);
      setShowSubline(true);
      setShowCta(true);
    }
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setTimeout(() => {
      setHeroArtReady((ready) => (ready ? ready : true));
    }, 2800);
    return () => window.clearTimeout(id);
  }, [reduceMotion]);

  useEffect(() => {
    router.prefetch(nextHref);
  }, [router, nextHref]);

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

            <div className={`${HERO_ILLUSTRATION_TO_COPY_MT} flex w-full flex-col ${HERO_ACTION_HEADLINE_SUBLINE_GAP_CLASS} text-center`}>
              {reduceMotion ? (
                <h1 className="text-2xl font-semibold leading-8 tracking-tight text-[#121212]">
                  {HEADLINE}
                </h1>
              ) : (
                <WordByWordLine
                  as="h1"
                  ariaLabel={HEADLINE}
                  text={HEADLINE}
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
                {SUBLINE}
              </p>
            </div>

            <div className="mt-auto w-full pt-8">
              <button
                type="button"
                className={`primary-cta transition-opacity ${HERO_FADE_DURATION_CLASS} ease-out focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/30 focus-visible:ring-offset-2 ${
                  showCta ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
                tabIndex={showCta ? 0 : -1}
                onClick={() => router.push(nextHref)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
      <ManageBookingBottomSheet open={manageBookingOpen} onClose={() => setManageBookingOpen(false)} />
    </div>
  );
}
